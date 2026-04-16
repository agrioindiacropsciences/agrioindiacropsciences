"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Globe,
  Plus,
  Loader2,
  AlertCircle,
  Download,
  Printer,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";

export default function PriceListPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priceListUrl, setPriceListUrl] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [signedPreviewUrl, setSignedPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getAdminSettings();
        if (res.success && res.data) {
          const general = (res.data as any).general || {};
          const url = general.price_list_pdf_url || null;
          setPriceListUrl(url);
          setUpdatedAt((res.data as any).price_list_updated_at || null);
          
          if (url) {
            fetchSignedPreview();
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const fetchSignedPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await api.getPriceListSignedUrl(false);
      if (res.success && res.data) {
        setSignedPreviewUrl(res.data.url);
      }
    } catch (err) {
      console.error("Failed to fetch signed preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.updatePriceList(file);
      if (res.success && res.data) {
        setPriceListUrl(res.data.url);
        setUpdatedAt(new Date().toISOString()); // Optimistic update
        fetchSignedPreview(); // Refresh preview with new file
        toast({
          title: "Update Successful",
          description: "Official price list has been updated and is now live",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: res.error?.message || "Something went wrong during upload",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      e.target.value = ""; // Reset input
    }
  };

  const handlePrint = async () => {
    try {
      const res = await api.getPriceListSignedUrl(false);
      if (res.success && res.data) {
        // Fetch document content to bypass cross-origin restrictions
        const response = await fetch(res.data.url);
        if (!response.ok) throw new Error("Failed to fetch document");
        
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (err) {
              console.error("Internal Print Error:", err);
            }
            // Cleanup after a delay (dialog closes)
            setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 60000);
          }, 500);
        };
      }
    } catch (err) {
      console.error("Print Error:", err);
      toast({ 
        title: "Print Error", 
        description: "Failed to initialize print. The document might be blocked or unreachable.", 
        variant: "destructive" 
      });
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.getPriceListSignedUrl(true);
      if (res.success && res.data) {
        const link = document.createElement("a");
        link.href = res.data.url;
        link.download = "Agrio_India_Price_List.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      toast({ title: "Download Error", description: "Failed to fetch document", variant: "destructive" });
    }
  };

  const handleOpenOriginal = async () => {
    try {
      const res = await api.getPriceListSignedUrl(false);
      if (res.success && res.data) {
        window.open(res.data.url, "_blank");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to open document", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Price List Management</h1>
            <p className="text-white/80 text-sm">Update official pricing and margins for all distributors</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Published Price List
            </CardTitle>
            <CardDescription>
              This document is visible to all logged-in dealers and distributors in the mobile app.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              {priceListUrl ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="divide-y divide-gray-100"
                >
                  {/* Active List View */}
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-blue-50 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-5">
                          <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner group transition-transform hover:scale-105">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Agrio_India_Price_List.pdf</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                              <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-xs text-blue-600/80 uppercase font-bold tracking-wider">Live & Visible to Distributors</p>
                              </div>
                              {updatedAt && (
                                <p className="text-[11px] text-gray-500 font-medium">
                                  Last updated: <span className="text-gray-900">{new Date(updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                          <Button variant="outline" size="lg" className="flex-1 lg:flex-none h-12 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="lg" className="flex-1 lg:flex-none h-12 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print
                          </Button>
                          <Button variant="default" size="lg" className="flex-1 lg:flex-none h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all" onClick={handleOpenOriginal}>
                            <Eye className="h-4 w-4 mr-2" />
                            Open Original
                          </Button>
                        </div>
                      </div>

                      {/* Two Column Layout for Preview and Replace */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* PDF Preview Section */}
                        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/50 h-full flex flex-col">
                          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Live Preview
                            </h4>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Interactive Document Viewer
                            </span>
                          </div>
                          <div className="relative flex-1 aspect-[3/4] w-full bg-white">
                            {previewLoading ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
                                <Loader2 className="h-10 w-10 animate-spin opacity-50" />
                                <p className="text-xs font-bold uppercase tracking-widest">Generating Secure Preview</p>
                              </div>
                            ) : signedPreviewUrl ? (
                              <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(signedPreviewUrl)}&embedded=true`}
                                className="w-full h-full border-0 animate-in fade-in duration-700"
                                title="Price List Preview"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400">
                                <AlertCircle className="h-10 w-10 opacity-30" />
                                <p className="text-xs font-bold uppercase tracking-widest text-center px-4">
                                  Preview Unavailable<br/>
                                  <span className="opacity-60 text-[10px] normal-case font-normal mt-1 block">Click &quot;Open Original&quot; to view the file</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Replace Section */}
                        <div className="p-8 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-center">
                          <div className="max-w-xl mx-auto w-full text-center space-y-6">
                            <div className="space-y-2">
                              <h4 className="text-xl font-bold text-gray-900">Need to update pricing?</h4>
                              <p className="text-sm text-gray-500">Upload a New PDF to replace the current version. This will immediately update the price list for all users in the mobile app.</p>
                            </div>

                            <div className="relative">
                              <Input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="pdf-replace"
                                disabled={saving}
                              />
                              <Label
                                htmlFor="pdf-replace"
                                className={cn(
                                  "flex flex-col items-center justify-center gap-4 w-full py-12 px-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
                                  saving 
                                    ? "border-gray-200 bg-gray-100 cursor-not-allowed" 
                                    : "border-gray-200 bg-white hover:border-primary hover:bg-primary/5 hover:shadow-inner group"
                                )}
                              >
                                <div className={cn(
                                  "h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300",
                                  saving ? "bg-gray-200" : "bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white"
                                )}>
                                  {saving ? (
                                    <Loader2 className="h-7 w-7 animate-spin" />
                                  ) : (
                                    <Plus className="h-7 w-7" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-lg">
                                    {saving ? "Replacing Current Version..." : "Replace with New PDF"}
                                  </p>
                                  {!saving && <p className="text-sm text-gray-500 mt-1">Drag and drop or click to select file</p>}
                                </div>
                              </Label>
                            </div>

                            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
                              <AlertCircle className="h-4 w-4" />
                              Warning: This action will permanently overwrite the current document.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 sm:p-12 text-center"
                >
                  <div className="max-w-md mx-auto space-y-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                      <div className="relative h-24 w-24 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
                        <Plus className="h-12 w-12" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900">No Price List Published</h3>
                      <p className="text-gray-500 leading-relaxed">
                        Your distributors are waiting for the latest pricing. Upload a PDF document to make it available globally.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                        disabled={saving}
                      />
                      <Button 
                        asChild 
                        size="lg" 
                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <label htmlFor="pdf-upload" className="cursor-pointer">
                          {saving ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Plus className="mr-3 h-6 w-6" />}
                          {saving ? "Publishing Document..." : "Upload & Publish Price List"}
                        </label>
                      </Button>
                      <p className="text-xs text-gray-400">
                        Supported format: <strong>PDF</strong> • Max size: <strong>20 MB</strong>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

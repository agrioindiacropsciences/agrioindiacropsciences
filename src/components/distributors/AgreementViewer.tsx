"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Loader2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as api from "@/lib/api";

interface AgreementViewerProps {
  isOpen: boolean;
  onClose: () => void;
  distributorId?: string; // If provided, uses admin API, else uses dealer API
  businessName?: string;
  dealerCode?: string;
}

export function AgreementViewer({
  isOpen,
  onClose,
  distributorId,
  businessName = "Dealer Agreement",
  dealerCode
}: AgreementViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const fetchAgreement = useCallback(async () => {
    setIsLoading(true);
    try {
      let blob;
      if (distributorId) {
        blob = await api.getAdminDealerAgreementBlob(distributorId, false);
      } else {
        blob = await api.getDealerAgreementBlob(false);
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Failed to fetch agreement:", error);
    } finally {
      setIsLoading(false);
    }
  }, [distributorId]);

  useEffect(() => {
    if (isOpen) {
      fetchAgreement();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [isOpen, fetchAgreement]);

  const handleDownload = async () => {
    try {
      let blob;
      if (distributorId) {
        blob = await api.getAdminDealerAgreementBlob(distributorId, true);
      } else {
        blob = await api.getDealerAgreementBlob(true);
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Agrio_Agreement_${dealerCode || "Draft"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download agreement:", error);
    }
  };

  const handlePrint = async () => {
    if (!previewUrl) return;
    setIsPrinting(true);
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = previewUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error("Print failed:", e);
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 60000);
        }, 500);
      };
    } catch (error) {
      console.error("Failed to print:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 overflow-hidden border-0 bg-slate-900 rounded-3xl">
        <DialogHeader className="p-4 bg-white border-b flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 leading-tight">
                {businessName}
              </DialogTitle>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                Authorized Dealer Agreement • {dealerCode || "Pending"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-8">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 hover:bg-slate-50 text-slate-600"
              onClick={handlePrint}
              disabled={isPrinting || isLoading}
            >
              {isPrinting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 hover:bg-slate-50 text-slate-600"
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-slate-800 relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/50">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="text-sm font-bold uppercase tracking-widest animate-pulse">
                Generating Agreement Preview
              </p>
            </div>
          ) : previewUrl ? (
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
              className="w-full h-full border-0 shadow-2xl"
              title="Agreement Preview"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/40">
              <FileText className="h-16 w-16 mb-2 opacity-20" />
              <p className="text-sm font-medium">Failed to load agreement</p>
              <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300" onClick={fetchAgreement}>
                Try again
              </Button>
            </div>
          )}
        </div>

        <div className="bg-slate-950 p-3 px-6 shrink-0 flex items-center justify-between text-white/40 text-[10px] uppercase tracking-widest font-bold">
           <span>AGRIO INDIA CROP SCIENCE • LEGAL DEPARTMENT</span>
           <span>DIGITALLY SIGNED DOCUMENT</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

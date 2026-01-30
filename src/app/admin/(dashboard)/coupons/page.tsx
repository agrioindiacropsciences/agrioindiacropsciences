"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Ticket,
  Loader2,
  Filter,
  QrCode,
  Gift,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AdminCoupon, Product, Campaign } from "@/lib/api";

export default function CouponsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [createCampaignDialogOpen, setCreateCampaignDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [generateQRCodes, setGenerateQRCodes] = useState(true);
  const [qrCodesPreview, setQrCodesPreview] = useState<Array<{ code: string; qrUrl: string }>>([]);
  const [qrBatchInfo, setQrBatchInfo] = useState<{ batchId?: string; generatedCount?: number } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [generateForm, setGenerateForm] = useState({
    campaign_id: "",
    count: "100",
    product_id: "",
    prefix: "",
    expiry_date: "",
  });

  const [campaignForm, setCampaignForm] = useState<{
    name: string;
    name_hi: string;
    start_date: string;
    end_date: string;
    distribution_type: "RANDOM" | "SEQUENTIAL" | "FIRST_COME";
    is_active: boolean;
    tier_name: string;
    reward_name: string;
    reward_type: "CASHBACK" | "DISCOUNT" | "GIFT";
    reward_value: string;
    probability: string;
  }>({
    name: "",
    name_hi: "",
    start_date: "",
    end_date: "",
    distribution_type: "RANDOM",
    is_active: true,
    tier_name: "Default Tier",
    reward_name: "",
    reward_type: "CASHBACK",
    reward_value: "100",
    probability: "1",
  });

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminCoupons(page, 10, statusFilter !== "all" ? statusFilter : undefined);
      if (response.success && response.data) {
        setCoupons(response.data.coupons || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    }
    setIsLoading(false);
  }, [page, statusFilter]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.getProducts({ limit: 100 });
      if (response.success && response.data) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await api.getAdminCampaigns({ limit: 100 });
      if (response.success && response.data) {
        const campaignsData = response.data.campaigns || response.data.data || (Array.isArray(response.data) ? response.data : []);
        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
    fetchCampaigns();
  }, [fetchCoupons, fetchProducts, fetchCampaigns]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch = coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      return matchesSearch;
    });
  }, [coupons, searchQuery]);

  const usedCount = coupons.filter(c => c.is_used).length;
  const unusedCount = coupons.filter(c => !c.is_used).length;

  const getQrUrl = (code: string) => {
    const logoUrl = "https://res.cloudinary.com/dyumjsohc/image/upload/v1768456817/assets/agrio_logo.png";
    return `https://quickchart.io/qr?text=${encodeURIComponent(code)}&centerImageUrl=${encodeURIComponent(logoUrl)}&centerImageSize=0.15&size=300&ecLevel=H`;
  };

  const handleGenerateCoupons = async () => {
    if (!generateForm.campaign_id || !generateForm.count) {
      toast({
        title: "Validation Error",
        description: "Please select a campaign and enter the number of coupons",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.generateCoupons({
        campaign_id: generateForm.campaign_id,
        count: parseInt(generateForm.count),
        product_id: generateForm.product_id || undefined,
        prefix: generateForm.prefix || undefined,
        expiry_date: generateForm.expiry_date || undefined,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `${generateForm.count} coupons generated successfully`,
        });

        if (generateQRCodes && response.data?.batch_id) {
          const batchId = response.data.batch_id;
          try {
            const listRes = await api.getAdminCoupons({ page: 1, limit: 1000, status: "unused" });
            const list = listRes.success ? listRes.data?.coupons || [] : [];
            const batchCoupons = list.filter((c) => c.batch_number === batchId);
            const qrItems = batchCoupons.map((c) => ({ code: c.code, qrUrl: getQrUrl(c.code) }));
            setQrCodesPreview(qrItems);
            setQrBatchInfo({ batchId, generatedCount: response.data?.generated_count });
            setQrDialogOpen(true);
          } catch {
            // ignore
          }
        }

        setGenerateDialogOpen(false);
        setGenerateForm({ campaign_id: "", count: "100", product_id: "", prefix: "", expiry_date: "" });
        fetchCoupons();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to generate coupons",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsGenerating(false);
  };

  const openPrintableQrSheet = () => {
    if (qrCodesPreview.length === 0) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `
      <html>
        <head>
          <title>QR Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
            .item { border: 1px solid #ddd; padding: 8px; border-radius: 8px; }
            .code { font-family: monospace; font-size: 10px; margin-top: 6px; word-break: break-all; }
            img { width: 100%; height: auto; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h2>Coupon QR Sheet</h2>
          ${qrBatchInfo?.batchId ? `<div>Batch: <span style="font-family: monospace">${qrBatchInfo.batchId}</span></div>` : ""}
          <div class="grid">
            ${qrCodesPreview.map((q) => `<div class="item"><img src="${q.qrUrl}" /><div class="code">${q.code}</div></div>`).join("")}
          </div>
          <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
        </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const downloadQrPng = (code: string, qrUrl: string) => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `QR-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllQrPngs = async () => {
    for (const item of qrCodesPreview) {
      downloadQrPng(item.code, item.qrUrl);
      await new Promise((r) => setTimeout(r, 250));
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.reward_value) {
      toast({
        title: "Validation Error",
        description: "Please enter campaign name and reward value",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingCampaign(true);
    try {
      const response = await api.createCampaign({
        name: campaignForm.name,
        name_hi: campaignForm.name_hi || undefined,
        start_date: campaignForm.start_date || undefined,
        end_date: campaignForm.end_date || undefined,
        distribution_type: campaignForm.distribution_type,
        is_active: campaignForm.is_active,
        tiers: [{
          tier_name: campaignForm.tier_name || "Default Tier",
          reward_name: campaignForm.reward_name || `₹${campaignForm.reward_value} ${campaignForm.reward_type}`,
          reward_type: campaignForm.reward_type,
          reward_value: parseInt(campaignForm.reward_value),
          probability: parseFloat(campaignForm.probability) || 1,
          priority: 1,
        }],
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Campaign created successfully!",
        });
        setCreateCampaignDialogOpen(false);
        setCampaignForm({
          name: "", name_hi: "", start_date: "", end_date: "",
          distribution_type: "RANDOM", is_active: true, tier_name: "Default Tier",
          reward_name: "", reward_type: "CASHBACK", reward_value: "100", probability: "1",
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create campaign",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsCreatingCampaign(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Ticket className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Coupons Management</h1>
                <p className="text-white/70 text-sm">Generate and manage promotional coupons</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setCreateCampaignDialogOpen(true)}
                className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Campaign
              </Button>
              <Button 
                onClick={() => setGenerateDialogOpen(true)}
                className="bg-white text-orange-600 hover:bg-white/90 shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Coupons
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{total}</p>
              <p className="text-xs text-white/70">Total Coupons</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{unusedCount}</p>
              <p className="text-xs text-white/70">Unused</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{usedCount}</p>
              <p className="text-xs text-white/70">Used</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 bg-gray-50 border-gray-200"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                <SelectTrigger className="w-32 h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unused">Unused</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => fetchCoupons()} variant="secondary" className="h-11">
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Coupons Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">Coupon Code</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Reward</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length > 0 ? (
                    filteredCoupons.map((coupon, index) => (
                      <motion.tr
                        key={coupon.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4 text-gray-400" />
                            <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{coupon.product?.name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Gift className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">
                              {coupon.reward_type === "CASHBACK" && `₹${coupon.reward_value}`}
                              {coupon.reward_type === "DISCOUNT" && `${coupon.reward_value}%`}
                              {coupon.reward_type === "GIFT" && "Gift"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={coupon.is_used ? "secondary" : "success"}>
                            {coupon.is_used ? "Used" : "Unused"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{coupon.redeemed_by?.name || "-"}</TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="text-primary p-0"
                            onClick={async () => {
                              try {
                                const response = await api.getAdminCoupon(coupon.id);
                                if (response.success && response.data) {
                                  toast({
                                    title: "Coupon Details",
                                    description: `Code: ${response.data.code}, Status: ${response.data.is_used ? 'Used' : 'Unused'}`,
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to load coupon details",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Ticket className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No coupons found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-gray-500">
          Showing {filteredCoupons.length} of {total} results
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={page === p ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
              {p}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </motion.div>

      {/* Generate Coupon Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate New Coupons
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Campaign *</Label>
              <Select 
                value={generateForm.campaign_id || "none"}
                onValueChange={(value) => setGenerateForm({ ...generateForm, campaign_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a campaign</SelectItem>
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name} {campaign.is_active ? '' : '(Inactive)'}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-campaigns" disabled>No campaigns - Create one first</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Number of Coupons *</Label>
              <Input 
                type="number" 
                placeholder="100" 
                className="mt-1"
                value={generateForm.count}
                onChange={(e) => setGenerateForm({ ...generateForm, count: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="generate-qr"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={generateQRCodes}
                onChange={(e) => setGenerateQRCodes(e.target.checked)}
              />
              <Label htmlFor="generate-qr" className="cursor-pointer text-sm">Generate QR codes</Label>
            </div>
            <div>
              <Label>Linked Product (Optional)</Label>
              <Select 
                value={generateForm.product_id || "none"}
                onValueChange={(value) => setGenerateForm({ ...generateForm, product_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific product</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code Prefix (Optional)</Label>
              <Input 
                placeholder="e.g., AGRI" 
                className="mt-1"
                value={generateForm.prefix}
                onChange={(e) => setGenerateForm({ ...generateForm, prefix: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateCoupons} disabled={isGenerating || !generateForm.campaign_id}>
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={createCampaignDialogOpen} onOpenChange={setCreateCampaignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Create New Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Campaign Name *</Label>
              <Input 
                placeholder="e.g., Summer Sale 2026" 
                className="mt-1"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Campaign Name (Hindi)</Label>
              <Input 
                placeholder="e.g., गर्मी की बिक्री" 
                className="mt-1"
                value={campaignForm.name_hi}
                onChange={(e) => setCampaignForm({ ...campaignForm, name_hi: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" className="mt-1" value={campaignForm.start_date} onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" className="mt-1" value={campaignForm.end_date} onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })} />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Reward Tier</h4>
              <div className="space-y-3">
                <div>
                  <Label>Reward Type *</Label>
                  <Select value={campaignForm.reward_type} onValueChange={(value: "CASHBACK" | "DISCOUNT" | "GIFT") => setCampaignForm({ ...campaignForm, reward_type: value })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASHBACK">Cashback</SelectItem>
                      <SelectItem value="DISCOUNT">Discount</SelectItem>
                      <SelectItem value="GIFT">Free Gift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reward Value (₹) *</Label>
                  <Input type="number" placeholder="e.g., 100" className="mt-1" value={campaignForm.reward_value} onChange={(e) => setCampaignForm({ ...campaignForm, reward_value: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCampaignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCampaign} disabled={isCreatingCampaign || !campaignForm.name}>
              {isCreatingCampaign && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Codes Preview Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Generated QR Codes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {qrBatchInfo?.generatedCount && (
              <p className="text-sm text-gray-500">
                Generated: <span className="font-medium">{qrBatchInfo.generatedCount}</span>
              </p>
            )}
            <div className="flex gap-2">
              <Button onClick={openPrintableQrSheet} disabled={qrCodesPreview.length === 0}>Print Sheet</Button>
              <Button variant="outline" onClick={downloadAllQrPngs} disabled={qrCodesPreview.length === 0}>Download PNGs</Button>
              <Button variant="outline" onClick={() => { setQrCodesPreview([]); setQrBatchInfo(null); setQrDialogOpen(false); }}>Close</Button>
            </div>
            {qrCodesPreview.length === 0 ? (
              <p className="text-sm text-gray-500">No QR preview available.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {qrCodesPreview.map((item) => (
                  <div key={item.code} className="border rounded-xl p-3 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.qrUrl} alt={`QR ${item.code}`} className="w-full h-auto rounded-lg" />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs break-all">{item.code}</span>
                      <Button size="sm" variant="secondary" onClick={() => downloadQrPng(item.code, item.qrUrl)}>
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

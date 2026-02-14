"use client";

import Link from "next/link";

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
  Trash2,
  Upload,
  ImagePlus,
  LayoutGrid,
  List,
  Activity,
  FileSpreadsheet,
  FileCheck,
  ArrowRight,
  Database,
  History,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AdminCoupon, Product, Campaign } from "@/lib/api";

export default function CouponsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("used");
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  const [createCampaignDialogOpen, setCreateCampaignDialogOpen] = useState(false);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewCouponDialogOpen, setViewCouponDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<AdminCoupon | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);


  const [campaignForm, setCampaignForm] = useState<{
    name: string;
    name_hi: string;
    start_date: string;
    end_date: string;
    distribution_type: "RANDOM" | "SEQUENTIAL" | "FIRST_COME";
    is_active: boolean;
    total_coupons: string;
    tiers: Array<{
      id?: string;
      reward_type: "CASHBACK" | "DISCOUNT" | "GIFT";
      reward_value: string;
      max_winners: string;
      current_winners?: number;
      image_url: string;
    }>;
  }>({
    name: "",
    name_hi: "",
    start_date: "",
    end_date: "",
    distribution_type: "RANDOM",
    is_active: true,
    total_coupons: "100",
    tiers: [
      {
        reward_type: "CASHBACK",
        reward_value: "10",
        max_winners: "90",
        image_url: "",
      },
      {
        reward_type: "CASHBACK",
        reward_value: "5000",
        max_winners: "10",
        image_url: "",
      }
    ],
  });

  const [uploadingTierIndex, setUploadingTierIndex] = useState<number | null>(null);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminCoupons(page, 10, statusFilter !== "all" ? statusFilter : undefined, batchFilter || undefined);
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
  }, [page, statusFilter, batchFilter]);

  const fetchBatches = useCallback(async () => {
    setIsLoadingBatches(true);
    try {
      // Using named export directly
      const response = await api.getAdminBatches();
      console.log("[DEBUG] Batches RAW Response:", JSON.stringify(response, null, 2));
      if (response.success && response.data) {
        setBatches(response.data);
      } else {
        toast({
          title: "Inventory Alert",
          description: response.error?.message || "Failed to load upload history.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast({
        title: "Network Error",
        description: "Could not reach the server to fetch inventory.",
        variant: "destructive"
      });
    }
    setIsLoadingBatches(false);
  }, [toast]);

  useEffect(() => {
    if (activeTab === 'batches') {
      fetchBatches();
    }
  }, [activeTab, fetchBatches]);

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

  const downloadQrPng = (code: string, qrUrl: string) => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `QR-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmitCampaign = async () => {
    if (!campaignForm.name || campaignForm.tiers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter campaign name and at least one reward tier",
        variant: "destructive",
      });
      return;
    }

    const totalPrizes = campaignForm.tiers.reduce((acc, t) => acc + parseInt(t.max_winners || "0"), 0);
    const poolSize = parseInt(campaignForm.total_coupons || "0") || totalPrizes;

    setIsCreatingCampaign(true);
    try {
      const payload = {
        name: campaignForm.name,
        name_hi: campaignForm.name_hi || undefined,
        start_date: campaignForm.start_date || undefined,
        end_date: campaignForm.end_date || undefined,
        distribution_type: campaignForm.distribution_type,
        is_active: campaignForm.is_active,
        total_qr_codes: poolSize,
        tiers: campaignForm.tiers.map((t, idx) => ({
          ...(t.id && { id: t.id }), // Include ID if editing
          tier_name: `Tier ${idx + 1}`,
          reward_name: t.reward_type === "GIFT" ? t.reward_value : `₹${t.reward_value} ${t.reward_type}`,
          reward_type: t.reward_type === "GIFT" ? "GIFT" : t.reward_type as any,
          reward_value: t.reward_type === "GIFT" ? 0 : parseInt(t.reward_value),
          probability: poolSize > 0 ? (parseInt(t.max_winners) / poolSize) : 0,
          priority: idx + 1,
          max_winners: parseInt(t.max_winners),
          ...(t.current_winners !== undefined && { current_winners: t.current_winners }),
          image_url: t.reward_type === "GIFT" ? t.image_url.trim() : undefined,
        })),
      };

      const response = editingCampaignId
        ? await api.updateCampaign(editingCampaignId, payload)
        : await api.createCampaign(payload);

      if (response.success) {
        toast({
          title: "Success",
          description: editingCampaignId ? "Campaign updated successfully!" : "Campaign created successfully!",
        });
        setCreateCampaignDialogOpen(false);
        setEditingCampaignId(null);
        setCampaignForm({
          name: "", name_hi: "", start_date: "", end_date: "",
          distribution_type: "RANDOM", is_active: true, total_coupons: "100",
          tiers: [
            { reward_type: "CASHBACK", reward_value: "10", max_winners: "90", image_url: "" },
            { reward_type: "CASHBACK", reward_value: "5000", max_winners: "10", image_url: "" }
          ]
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save campaign:", error);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsCreatingCampaign(false);
  };

  const handleEditCampaign = (camp: Campaign) => {
    setEditingCampaignId(camp.id);
    const mappedTiers = (camp.tiers || []).map(t => ({
      id: t.id,
      reward_type: (t.reward_type === 'POINTS' ? 'CASHBACK' : t.reward_type) as "CASHBACK" | "DISCOUNT" | "GIFT",
      reward_value: t.reward_type === 'GIFT' ? t.reward_name : String(t.reward_value),
      max_winners: String(t.max_winners || 0),
      current_winners: t.current_winners || 0,
      image_url: t.image_url || ""
    }));
    setCampaignForm({
      name: camp.name,
      name_hi: camp.name_hi || "",
      start_date: camp.start_date ? new Date(camp.start_date).toISOString().split('T')[0] : "",
      end_date: camp.end_date ? new Date(camp.end_date).toISOString().split('T')[0] : "",
      distribution_type: camp.distribution_type || "RANDOM",
      is_active: camp.is_active,
      total_coupons: String(camp.total_qr_codes || 0),
      tiers: mappedTiers
    });
    setCreateCampaignDialogOpen(true);
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"? This will not work if the campaign has active coupons.`)) return;

    try {
      const res = await api.deleteCampaign(id);
      if (res.success) {
        toast({ title: "Deleted", description: "Campaign removed." });
        fetchCampaigns();
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingTierIndex(index);
    try {
      const response = await api.uploadMedia(file, "campaigns");
      if (response.success && response.data) {
        const newTiers = [...campaignForm.tiers];
        newTiers[index].image_url = response.data.url;
        setCampaignForm({ ...campaignForm, tiers: newTiers });
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Upload failed",
        variant: "destructive",
      });
    }
    setUploadingTierIndex(null);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteCoupon(id);
      if (res.success) {
        toast({ title: "Deleted", description: "Coupon deleted successfully" });
        fetchCoupons();
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsDeleting(false);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast({ title: "No selection", description: "Select coupons to delete", variant: "destructive" });
      return;
    }
    if (!confirm(`Delete ${ids.length} selected coupon(s)?`)) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteCouponsBulk(ids);
      if (res.success && res.data) {
        toast({ title: "Deleted", description: `${res.data.deleted_count} coupon(s) deleted` });
        setSelectedIds(new Set());
        fetchCoupons();
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsDeleting(false);
  };

  const allSelected = filteredCoupons.length > 0 && filteredCoupons.every((c) => selectedIds.has(c.id));
  const someSelected = filteredCoupons.some((c) => selectedIds.has(c.id));

  const handleClearHistory = async () => {
    const redeemedIds = coupons.filter(c => c.is_used).map(c => c.id);
    if (redeemedIds.length === 0) {
      toast({ title: "No history", description: "There are no redeemed coupons to clear." });
      return;
    }

    if (!confirm(`This will delete ALL ${redeemedIds.length} redeemed records in the current set. Continue?`)) return;

    setIsDeleting(true);
    try {
      const res = await api.deleteCouponsBulk(redeemedIds);
      if (res.success) {
        toast({ title: "History Cleared", description: "Redemption history has been purged." });
        setSelectedIds(prev => {
          const n = new Set(prev);
          redeemedIds.forEach(id => n.delete(id));
          return n;
        });
        fetchCoupons();
      }
    } catch {
      toast({ title: "Error", description: "Failed to clear history", variant: "destructive" });
    }
    setIsDeleting(false);
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
                <p className="text-white/70 text-sm">Design rewards and manage QR code inventory</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingCampaignId(null);
                  setCampaignForm({
                    name: "", name_hi: "", start_date: "", end_date: "",
                    distribution_type: "RANDOM", is_active: true, total_coupons: "100",
                    tiers: [
                      { reward_type: "CASHBACK", reward_value: "10", max_winners: "90", image_url: "" },
                      { reward_type: "CASHBACK", reward_value: "5000", max_winners: "10", image_url: "" }
                    ]
                  });
                  setCreateCampaignDialogOpen(true);
                }}
                className="bg-white/20 border-white/30 hover:bg-white/30 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
              <Link href="/admin/coupons/bulk">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-0">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
              </Link>
            </div>
          </div>


        </div>
      </motion.div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/50 backdrop-blur border border-gray-100 p-1 rounded-xl h-auto self-start">
          <TabsTrigger
            value="campaigns"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Reward Campaigns
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Scan History
          </TabsTrigger>
          <TabsTrigger
            value="batches"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-0">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">Campaign</TableHead>
                    <TableHead className="font-semibold">Structure</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Dates</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length > 0 ? (
                    campaigns.map((camp) => (
                      <TableRow key={camp.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{camp.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-tight uppercase">{camp.id.slice(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {camp.tiers?.slice(0, 2).map((t, i) => (
                              <Badge key={i} variant="secondary" className="bg-orange-50 text-orange-700 text-[10px] scale-90 origin-left">
                                {t.reward_name}
                              </Badge>
                            ))}
                            {(camp.tiers?.length || 0) > 2 && (
                              <span className="text-[10px] text-gray-400">+{camp.tiers!.length - 2}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={camp.is_active ? "success" : "secondary"} className="rounded-full text-[10px]">
                            {camp.is_active ? "Active" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[11px] text-gray-500">
                          {camp.start_date ? new Date(camp.start_date).toLocaleDateString() : 'N/A'} - {camp.end_date ? new Date(camp.end_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 text-xs"
                              onClick={() => handleEditCampaign(camp)}
                            >
                              Manage
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 text-xs hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <Sparkles className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-medium">No campaigns created yet</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="relative w-40">
                  <Input
                    placeholder="Batch #"
                    value={batchFilter}
                    onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
                    className="h-11 bg-gray-50 border-gray-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                  <SelectTrigger className="w-32 h-11">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="used">Scanned Only</SelectItem>
                    <SelectItem value="unused">Waitlist (Unscanned)</SelectItem>
                    <SelectItem value="all">View All (Admin)</SelectItem>
                  </SelectContent>
                </Select>
                {someSelected && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="h-11 px-6 rounded-xl shadow-sm"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Delete Selected ({selectedIds.size})
                  </Button>
                )}
                {statusFilter === 'used' && usedCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearHistory}
                    disabled={isDeleting}
                    className="h-11 px-6 rounded-xl border-red-100 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Redeemed
                  </Button>
                )}
                <Button onClick={() => fetchCoupons()} variant="secondary" className="h-11 px-8 rounded-xl font-semibold">
                  Update List
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="text-gray-400 text-sm">Loading activity data...</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedIds(new Set(filteredCoupons.map((c) => c.id)));
                              else setSelectedIds(new Set());
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold">Batch</TableHead>
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold">Win Reward</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="text-right">Detail</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.length > 0 ? (
                        filteredCoupons.map((coupon, idx) => (
                          <TableRow key={coupon.id} className="group hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(coupon.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedIds((prev) => {
                                    const n = new Set(prev);
                                    if (checked) n.add(coupon.id);
                                    else n.delete(coupon.id);
                                    return n;
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <QrCode className="h-3.5 w-3.5 text-gray-400" />
                                <span className="font-mono font-bold text-gray-800 text-xs">{coupon.code}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                {coupon.batch_number || "GEN-001"}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-gray-500 truncate max-w-[120px]">{coupon.product?.name || "-"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                <Gift className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-xs font-bold text-gray-700">
                                  {coupon.reward_type === 'CASHBACK' ? `₹${coupon.reward_value}` :
                                    coupon.reward_type === 'DISCOUNT' ? `${coupon.reward_value}%` :
                                      coupon.reward_type === 'GIFT' ? 'Gift' : '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={coupon.is_used ? "secondary" : "success"} className="text-[10px] px-2 py-0">
                                {coupon.is_used ? "Redeemed" : "Available"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-medium text-gray-600">{coupon.redeemed_by?.name || "-"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  onClick={async () => {
                                    const resp = await api.getAdminCoupon(coupon.id);
                                    if (resp.success) { setSelectedCoupon(resp.data as AdminCoupon); setViewCouponDialogOpen(true); }
                                  }}
                                >View</Button>
                                {!coupon.is_used && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                  ><Trash2 className="h-3.5 w-3.5" /></Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-20 grayscale opacity-50">
                            <Ticket className="h-12 w-12 mx-auto mb-2" />
                            <p>No scans matching your filter</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination Inside Tab */}
                  <div className="p-4 border-t flex items-center justify-between bg-gray-50/30">
                    <p className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-bold" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="batches" className="mt-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Bulk Upload Inventory</h2>
              <p className="text-sm text-gray-500 font-medium">Manage and track your Excel data batches</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBatches}
                disabled={isLoadingBatches}
                className="h-11 px-5 rounded-2xl border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBatches ? 'animate-spin' : ''}`} />
                Scan for Inventory
              </Button>
              <Link href="/admin/coupons/bulk">
                <Button className="h-11 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New File
                </Button>
              </Link>
            </div>
          </div>

          {isLoadingBatches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-0 shadow-sm animate-pulse bg-gray-50/10 rounded-3xl h-64" />
              ))}
            </div>
          ) : batches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {batches.map((batch) => {
                const total = batch.total_count;
                const used = batch.redeemed_count;
                const left = total - used;
                const percentageUsed = Math.round((used / total) * 100);
                const isUncategorized = batch.batch_number === 'UNCATEGORIZED';

                return (
                  <Card key={batch.batch_number} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white flex flex-col">
                    <div className={`h-3 w-full ${isUncategorized ? 'bg-amber-400' : 'bg-orange-500'}`} />
                    <CardHeader className="pb-4 pt-8 px-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`h-16 w-16 rounded-3xl flex items-center justify-center shadow-inner ${isUncategorized ? 'bg-amber-50 text-amber-600' : 'bg-orange-50 text-orange-600'}`}>
                          {isUncategorized ? <Database className="h-8 w-8" /> : <FileSpreadsheet className="h-8 w-8" />}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge variant="outline" className="text-[11px] font-black border-2 border-gray-100 rounded-full px-3 py-1">
                            {total.toLocaleString()} CODES
                          </Badge>
                          <div className="flex items-center gap-1.5 text-[9px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <FileCheck className="h-3 w-3" />
                            S.No + Auth Verified
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-black text-gray-900 tracking-tight truncate pr-4">
                        {isUncategorized ? 'Legacy Uploads' : batch.batch_number}
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                        <History className="h-3.5 w-3.5 mr-1.5 text-orange-500/50" />
                        {new Date(batch.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 px-8 pb-8 flex flex-col justify-between space-y-8">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-1">Consumption</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-gray-900">{used}</span>
                              <span className="text-sm font-bold text-gray-400 italic">used</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-700">{left}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining</p>
                          </div>
                        </div>

                        <div className="relative pt-1">
                          <Progress value={percentageUsed} className="h-4 bg-gray-50 rounded-full border border-gray-100" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={`text-[9px] font-black tracking-widest ${percentageUsed > 50 ? 'text-white' : 'text-gray-400'}`}>
                              {percentageUsed}% EXHAUSTED
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          className="flex-1 bg-gray-900 hover:bg-black text-white rounded-[1.25rem] h-12 text-sm font-bold shadow-lg shadow-gray-200 group-hover:translate-x-1 transition-transform"
                          onClick={() => {
                            setBatchFilter(batch.batch_number === 'UNCATEGORIZED' ? "" : batch.batch_number);
                            setActiveTab('history');
                          }}
                        >
                          Manage codes
                          <ArrowRight className="h-4 w-4 ml-2 opacity-50" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={used > 0}
                          className="h-12 w-12 shrink-0 border-2 border-gray-100 hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all rounded-[1.25rem] text-gray-300"
                          onClick={async () => {
                            if (confirm(`CRITICAL: This will permanently delete ${left} unused QR codes. This action cannot be undone. Proceed?`)) {
                              try {
                                const res = await api.deleteAdminBatch(batch.batch_number);
                                if (res.success) {
                                  toast({ title: "Inventory Updated", description: "File successfully removed." });
                                  fetchBatches();
                                }
                              } catch (err) { }
                            }
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add a blank card to encourage adding more? */}
              <Link href="/admin/coupons/bulk" className="group">
                <div className="h-full border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center py-20 px-10 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-500">
                  <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-10 w-10 text-gray-200 group-hover:text-orange-300" />
                  </div>
                  <p className="text-gray-400 font-bold group-hover:text-orange-400">Add another batch</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border-4 border-dashed border-gray-100 py-32 text-center shadow-sm">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileCheck className="h-12 w-12 text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your Inventory is Empty</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-10 font-medium">Connect your spreadsheet data to start generating QR codes for your reward campaigns.</p>
              <Link href="/admin/coupons/bulk">
                <Button className="px-12 h-14 rounded-2xl font-black text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200 transition-all hover:scale-105">
                  <Upload className="h-6 w-6 mr-3" />
                  Upload Your First XLS
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={viewCouponDialogOpen} onOpenChange={setViewCouponDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Coupon Detail View
            </DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-6">
              <div className="flex justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <img src={getQrUrl(selectedCoupon.code)} alt="QR" className="w-44 h-44 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block mb-1 uppercase tracking-widest text-[9px]">Coupon Code</span>
                  <span className="text-sm font-mono font-bold tracking-wider">{selectedCoupon.code}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block mb-1 uppercase tracking-widest text-[9px]">Current Status</span>
                  <Badge variant={selectedCoupon.is_used ? "secondary" : "success"}>{selectedCoupon.is_used ? "Redeemed" : "Available"}</Badge>
                </div>
                <div className="p-3 bg-gray-100/50 rounded-lg col-span-2">
                  <span className="text-gray-400 block mb-1 uppercase tracking-widest text-[9px]">Linked Reward</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{selectedCoupon.reward_name || "Campaign Tier Reward"}</span>
                    <span className="px-2 py-0.5 bg-white rounded border uppercase text-[9px] font-black">{selectedCoupon.reward_type}</span>
                  </div>
                </div>
                {selectedCoupon.redeemed_by && (
                  <div className="p-3 bg-blue-50/50 rounded-lg col-span-2 flex items-center justify-between border border-blue-100">
                    <div>
                      <span className="text-blue-400 block mb-1 uppercase tracking-widest text-[9px]">Claimed By</span>
                      <span className="text-sm font-bold text-blue-900">{selectedCoupon.redeemed_by.name}</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-mono tracking-tighter">{new Date(selectedCoupon.scanned_at!).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setViewCouponDialogOpen(false)} className="flex-1 rounded-xl">Dismiss</Button>
                <Button onClick={() => downloadQrPng(selectedCoupon.code, getQrUrl(selectedCoupon.code))} className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold">Save QR Code</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={createCampaignDialogOpen} onOpenChange={setCreateCampaignDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl border-0 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-gray-900">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              Launch Reward Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 mt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Internal Campaign Name *</Label>
                <Input className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-sm" placeholder="e.g., Diwali Monsoon Rewards 2026" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Starts On</Label>
                <Input type="date" className="h-12 rounded-xl bg-gray-50 border-gray-100" value={campaignForm.start_date} onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">Expires On</Label>
                <Input type="date" className="h-12 rounded-xl bg-gray-50 border-gray-100" value={campaignForm.end_date} onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })} />
              </div>
            </div>

            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-200/20 rounded-full blur-2xl group-hover:bg-blue-300/30 transition-all duration-500" />
              <Label className="text-xs font-black text-blue-900 uppercase tracking-widest relative z-10">Inventory Size (Planned Scans) *</Label>
              <Input type="number" className="h-12 mt-2 bg-white border-blue-200 rounded-xl font-black text-blue-900 placeholder:text-blue-200" placeholder="1000" value={campaignForm.total_coupons} onChange={(e) => setCampaignForm({ ...campaignForm, total_coupons: e.target.value })} />
              <p className="text-[10px] text-blue-400 mt-3 italic font-medium leading-relaxed">Probability of winning a prize is weight-balanced against this number across all generated codes.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h4 className="text-sm font-black uppercase text-gray-900 tracking-tighter">Prize Distribution</h4>
                <Button variant="outline" size="sm" className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 font-bold h-8 px-4" onClick={() => setCampaignForm({ ...campaignForm, tiers: [...campaignForm.tiers, { reward_type: "CASHBACK", reward_value: "0", max_winners: "0", image_url: "" }] })}>+ Add Level</Button>
              </div>
              {campaignForm.tiers.map((t, i) => (
                <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative group hover:border-orange-200 transition-all duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Reward Type</Label>
                      <Select value={t.reward_type} onValueChange={(v: any) => { const n = [...campaignForm.tiers]; n[i].reward_type = v; setCampaignForm({ ...campaignForm, tiers: n }); }}>
                        <SelectTrigger className="h-10 text-xs font-bold rounded-lg bg-gray-50 border-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                          <SelectItem value="CASHBACK">💰 Instant Cashback</SelectItem>
                          <SelectItem value="GIFT">🎁 Physical Gift</SelectItem>
                          <SelectItem value="DISCOUNT">🏷️ Reward Discount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">{t.reward_type === 'GIFT' ? 'Item Name' : 'Reward Value (₹)'}</Label>
                      <Input className="h-10 text-xs font-bold rounded-lg bg-gray-50 border-0" value={t.reward_value} onChange={(e) => { const n = [...campaignForm.tiers]; n[i].reward_value = e.target.value; setCampaignForm({ ...campaignForm, tiers: n }); }} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-gray-400">Total Available Prizes (Winners Limit)</Label>
                      <Input type="number" className="h-10 text-xs font-bold rounded-lg bg-gray-50 border-0" value={t.max_winners} onChange={(e) => { const n = [...campaignForm.tiers]; n[i].max_winners = e.target.value; setCampaignForm({ ...campaignForm, tiers: n }); }} />
                    </div>
                  </div>

                  {t.reward_type === 'GIFT' && (
                    <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <div
                        className="h-14 w-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center cursor-pointer shadow-sm relative group/img overflow-hidden"
                        onClick={() => (document.getElementById(`up-${i}`) as any)?.click()}
                      >
                        {t.image_url ? (
                          <>
                            <img src={t.image_url} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                              <Trash2 className="h-4 w-4 text-white" />
                            </div>
                          </>
                        ) : (
                          uploadingTierIndex === i ? <Loader2 className="h-5 w-5 animate-spin text-orange-400" /> : <ImagePlus className="h-6 w-6 text-gray-200 group-hover:text-orange-300 transition-colors" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Visual Asset</p>
                        <p className="text-[9px] text-gray-300 font-medium">Shown to the user when they scratch-win this gift.</p>
                      </div>
                      <input type="file" id={`up-${i}`} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])} />
                    </div>
                  )}

                  {campaignForm.tiers.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 absolute -top-2 -right-2 bg-white border border-gray-100 shadow-md rounded-full text-gray-300 hover:text-red-500 hover:scale-110 active:scale-[0.95] transition-all" onClick={() => { const n = [...campaignForm.tiers]; n.splice(i, 1); setCampaignForm({ ...campaignForm, tiers: n }); }}><Trash2 className="h-3 w-3" /></Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-5 bg-orange-50/70 rounded-3xl border border-orange-100 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Activity className="h-20 w-20 text-orange-900" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner shadow-orange-200/50"><Activity className="h-6 w-6 text-orange-600" /></div>
              <div className="flex-1 relative z-10">
                <p className="text-[10px] font-black text-orange-900/50 uppercase tracking-widest">Winning Probability</p>
                <p className="text-2xl font-black text-orange-600 tracking-tighter">
                  {((campaignForm.tiers.reduce((acc, t) => acc + (parseInt(t.max_winners) || 0), 0) / (parseInt(campaignForm.total_coupons) || 1)) * 100).toFixed(1)}%
                  <span className="text-[10px] font-bold text-orange-800/40 ml-2 uppercase tracking-tight italic">Effective Hit Rate</span>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-10 flex gap-3">
            <Button variant="ghost" className="rounded-2xl h-14 font-black text-gray-400 hover:text-gray-900 px-8" onClick={() => setCreateCampaignDialogOpen(false)}>Close</Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl flex-1 h-14 font-black shadow-[0_10px_30px_-10px_rgba(234,88,12,0.5)] transition-all hover:-translate-y-1 active:scale-[0.98]"
              onClick={handleSubmitCampaign}
              disabled={isCreatingCampaign || !campaignForm.name}
            >
              {isCreatingCampaign ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <Sparkles className="h-5 w-5 mr-3" />}
              {editingCampaignId ? "Update Campaign" : "Deploy Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

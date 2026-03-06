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
  RefreshCw,
  Calendar,
  Trophy,
  Rocket
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
  const [isFetchingCouponDetails, setIsFetchingCouponDetails] = useState(false);
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


  return (
    <div className="space-y-8 pb-12">
      {/* Sophisticated Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 sm:p-12 text-white shadow-2xl shadow-slate-200"
      >
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/20 ring-4 ring-white/10 shrink-0">
                <Ticket className="h-10 w-10 text-white" />
              </div>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-5xl font-black tracking-tight"
                >
                  Coupon <span className="text-orange-500">List</span>
                </motion.h1>
                <p className="text-slate-400 text-lg mt-2 font-medium max-w-md">Create reward campaigns and manage your QR codes easily.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
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
                className="h-14 px-8 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 text-white font-black transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
              >
                <Plus className="h-5 w-5 mr-3" />
                New Campaign
              </Button>
              <Link href="/admin/coupons/bulk">
                <Button className="h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black shadow-xl shadow-orange-600/20 transition-all hover:scale-105 active:scale-95 border-0">
                  <Upload className="h-5 w-5 mr-3" />
                  Bulk Upload
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/5">
            {[
              { label: 'Total Campaigns', value: campaigns.filter(c => c.is_active).length, icon: Sparkles, color: 'text-orange-400' },
              { label: 'Usage Rate', value: total > 0 ? `${((usedCount / total) * 100).toFixed(1)}%` : '0%', icon: Activity, color: 'text-blue-400' },
              { label: 'Total Coupons', value: total.toLocaleString(), icon: Database, color: 'text-emerald-400' },
              { label: 'Not Used', value: (total - usedCount).toLocaleString(), icon: Ticket, color: 'text-purple-400' }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                  <p className="text-lg font-black text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Control Center */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto self-start border border-slate-200/50">
            {[
              { id: 'campaigns', label: 'Offer Campaigns', icon: Gift },
              { id: 'history', label: 'Scan History', icon: QrCode },
              { id: 'batches', label: 'File History', icon: Upload }
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/10 font-bold transition-all text-sm flex items-center gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {activeTab === 'history' && (
            <div className="flex items-center gap-3">
              <Button onClick={() => fetchCoupons()} variant="outline" className="h-12 px-6 rounded-xl font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh List
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="campaigns" className="mt-0 focus-visible:outline-none">
          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 border-0">
                    <TableHead className="py-6 px-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Campaign Name</TableHead>
                    <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Prizes</TableHead>
                    <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                    <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Dates</TableHead>
                    <TableHead className="py-6 px-8 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length > 0 ? (
                    campaigns.map((camp, idx) => (
                      <TableRow key={camp.id} className="group hover:bg-slate-50/80 transition-all border-slate-100">
                        <TableCell className="py-6 px-8">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                              {idx + 1}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-sm group-hover:text-orange-600 transition-colors">{camp.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase mt-0.5">{camp.id.slice(0, 12)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-wrap gap-1.5">
                            {camp.tiers?.slice(0, 3).map((t, i) => (
                              <Badge key={i} className="bg-white border-slate-100 text-slate-600 text-[10px] font-bold py-1 px-3 shadow-sm">
                                {t.reward_name}
                              </Badge>
                            ))}
                            {(camp.tiers?.length || 0) > 3 && (
                              <span className="text-[10px] font-black text-slate-300 ml-1">+{camp.tiers!.length - 3} More</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${camp.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-wider ${camp.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {camp.is_active ? "Active" : "Draft"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                              <span className="text-slate-300">Start:</span> {camp.start_date ? new Date(camp.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                              <span className="text-slate-300">Final:</span> {camp.end_date ? new Date(camp.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 px-4 rounded-xl text-orange-600 text-xs font-black hover:bg-orange-50 hover:text-orange-700 transition-all"
                              onClick={() => handleEditCampaign(camp)}
                            >
                              Manage
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                              onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-32 bg-slate-50/30">
                        <div className="flex flex-col items-center">
                          <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
                            <Sparkles className="h-10 w-10 text-slate-200" />
                          </div>
                          <p className="text-slate-900 font-black text-xl">No Campaigns Found</p>
                          <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Launch your first reward structure to begin generating secure coupons.</p>
                          <Button
                            onClick={() => setCreateCampaignDialogOpen(true)}
                            className="mt-8 bg-orange-600 hover:bg-orange-700 rounded-xl h-12 px-8 font-black shadow-lg shadow-orange-600/20"
                          >
                            Create One Now
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-0 space-y-8 focus-visible:outline-none">
          {/* Advanced Filtering */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                  <Input
                    placeholder="Search coupon codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-sm"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-[10px] uppercase tracking-tighter mr-2">Batch #</div>
                  <Input
                    placeholder="Enter ID"
                    value={batchFilter}
                    onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
                    className="pl-20 h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 transition-all font-mono font-bold text-sm"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                  <SelectTrigger className="h-14 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 transition-all font-bold px-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Display Mode" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                    <SelectItem value="used" className="rounded-lg">📊 Showing: Scanned Only</SelectItem>
                    <SelectItem value="unused" className="rounded-lg">⏳ Showing: Available Only</SelectItem>
                    <SelectItem value="all" className="rounded-lg">🌐 Showing: All Coupons</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  {someSelected ? (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      className="flex-1 h-14 rounded-2xl shadow-lg shadow-red-500/20 font-black transition-all hover:scale-105 active:scale-95"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                      Delete ({selectedIds.size})
                    </Button>
                  ) : (
                    <div className="flex-1 h-14 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Filter Applied</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-32 flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                    <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-2xl animate-pulse" />
                  </div>
                  <p className="text-slate-400 font-black text-sm uppercase tracking-widest animate-pulse">Loading Coupon Data...</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 border-0">
                        <TableHead className="w-16 px-8 py-6">
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedIds(new Set(filteredCoupons.map((c) => c.id)));
                              else setSelectedIds(new Set());
                            }}
                            className="rounded-md border-slate-200"
                          />
                        </TableHead>
                        <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Coupon Code</TableHead>
                        <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Batch ID</TableHead>
                        <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Reward</TableHead>
                        <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                        <TableHead className="py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Customer Details</TableHead>
                        <TableHead className="py-6 px-8 text-right text-[11px] font-black uppercase tracking-widest text-slate-400">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.length > 0 ? (
                        filteredCoupons.map((coupon) => (
                          <TableRow key={coupon.id} className="group hover:bg-slate-50 transition-all border-slate-100">
                            <TableCell className="px-8 py-4">
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
                                className="rounded-md border-slate-200"
                              />
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                  <QrCode className="h-4 w-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
                                </div>
                                <span className="font-mono font-black text-slate-900 text-xs tracking-widest">{coupon.code}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="text-[10px] font-mono font-bold text-slate-400 border-slate-100 bg-slate-50/50 px-2">
                                {coupon.batch_number || "GEN-001"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center">
                                  <Gift className="h-3.5 w-3.5 text-amber-600" />
                                </div>
                                <span className="text-xs font-black text-slate-700">
                                  {coupon.reward_type === 'CASHBACK' ? `₹${coupon.reward_value}` :
                                    coupon.reward_type === 'DISCOUNT' ? `${coupon.reward_value}%` :
                                      coupon.reward_type === 'GIFT' ? 'Gift' : '-'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                <div className={`h-1.5 w-1.5 rounded-full ${coupon.is_used ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-wider ${coupon.is_used ? 'text-slate-400' : 'text-emerald-600'}`}>
                                  {coupon.is_used ? "Used" : "Available"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {coupon.redeemed_by?.name ? (
                                <div className="flex items-center gap-3">
                                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-200/50">
                                    {coupon.redeemed_by.name[0]}
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{coupon.redeemed_by.name}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest italic">Not Yet Scanned</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-8 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-10 px-5 rounded-xl text-orange-600 text-xs font-black hover:bg-orange-50 hover:text-orange-700 transition-all"
                                  onClick={async () => {
                                    setSelectedCoupon({ code: coupon.code } as AdminCoupon);
                                    setViewCouponDialogOpen(true);
                                    setIsFetchingCouponDetails(true);
                                    const resp = await api.getAdminCoupon(coupon.id);
                                    if (resp.success) { setSelectedCoupon(resp.data as AdminCoupon); }
                                    setIsFetchingCouponDetails(false);
                                  }}
                                >
                                  View Details
                                </Button>
                                {!coupon.is_used && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-32 opacity-20 filter grayscale">
                            <div className="flex flex-col items-center">
                              <Database className="h-16 w-16 mb-4" />
                              <p className="text-lg font-black tracking-widest uppercase">No Results Found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Advanced Pagination */}
                  <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {filteredCoupons.length} coupons out of {total.toLocaleString()}
                      </p>
                      <div className="h-4 w-[1px] bg-slate-100 hidden sm:block" />
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                        Page {page} / {totalPages}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="h-10 px-6 rounded-xl font-black text-xs border-slate-100 hover:bg-slate-50 hover:text-orange-600 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="h-10 px-6 rounded-xl font-black text-xs border-slate-100 hover:bg-slate-50 hover:text-orange-600 transition-all active:scale-95 disabled:opacity-30 shadow-sm"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="mt-0 focus-visible:outline-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bulk Inventory <span className="text-orange-600">Operations</span></h2>
              <p className="text-slate-400 font-medium mt-1">Audit and maintain cryptographically generated QR batches</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBatches}
                disabled={isLoadingBatches}
                className="h-12 px-6 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 shadow-sm font-bold text-slate-600 transition-all active:scale-95"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingBatches ? 'animate-spin' : ''}`} />
                Scan Cold Storage
              </Button>
              <Link href="/admin/coupons/bulk">
                <Button className="h-12 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-600/20 font-black border-0 transition-all hover:scale-105 active:scale-95">
                  <Upload className="h-4 w-4 mr-3" />
                  Inject New Batch
                </Button>
              </Link>
            </div>
          </div>

          {isLoadingBatches ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-slate-50 animate-pulse border border-slate-100" />
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={batch.batch_number}
                  >
                    <Card className="group relative border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white hover:scale-[1.02] transition-all duration-500 flex flex-col h-full">
                      {/* Decorative Background Accent */}
                      <div className={`absolute top-0 right-0 w-32 h-32 ${isUncategorized ? 'bg-amber-500/5' : 'bg-orange-500/5'} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:opacity-100 opacity-50 transition-all`} />

                      <div className={`h-3 w-full ${isUncategorized ? 'bg-amber-400' : 'bg-orange-600'}`} />

                      <CardHeader className="pb-4 pt-8 px-8 flex-none">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-inner ${isUncategorized ? 'bg-amber-50 text-amber-600' : 'bg-orange-50 text-orange-600'}`}>
                            {isUncategorized ? <Database className="h-8 w-8" /> : <FileSpreadsheet className="h-8 w-8" />}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className="text-[10px] font-black border-2 border-slate-100 rounded-full px-4 py-1.5 bg-white text-slate-500">
                              {total.toLocaleString()} UNITS
                            </Badge>
                            <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                              <FileCheck className="h-3 w-3" />
                              VERIFIED ASSETS
                            </div>
                          </div>
                        </div>

                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight truncate pr-4">
                          {isUncategorized ? 'Legacy Repository' : batch.batch_number}
                        </CardTitle>
                        <CardDescription className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">
                          <History className="h-3.5 w-3.5 mr-2 text-slate-300" />
                          {new Date(batch.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 px-8 pb-8 flex flex-col justify-between space-y-8">
                        <div className="space-y-6">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2 ml-1">Consumption Audit</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-slate-900 tracking-tighter">{used.toLocaleString()}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Executed</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-slate-900 leading-none">{left.toLocaleString()}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Backlog</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                              <span>Batch Saturation</span>
                              <span className="text-slate-900">{percentageUsed}%</span>
                            </div>
                            <div className="relative h-4 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden shadow-inner">
                              <Progress value={percentageUsed} className={`h-full transition-all duration-1000 ${isUncategorized ? 'bg-amber-500' : 'bg-orange-600'}`} />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            className="flex-1 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl h-14 text-sm font-black shadow-xl shadow-slate-200/50 transition-all hover:scale-[1.02] active:scale-95"
                            onClick={() => {
                              setBatchFilter(batch.batch_number === 'UNCATEGORIZED' ? "" : batch.batch_number);
                              setActiveTab('history');
                            }}
                          >
                            Inspect Shards
                            <ArrowRight className="h-4 w-4 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={used > 0}
                            className="h-14 w-14 shrink-0 border-2 border-slate-100 hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all rounded-2xl text-slate-300 shadow-sm flex items-center justify-center"
                            onClick={async () => {
                              if (confirm(`RECOVERY WARNING: This will permanently purge ${left} unused cryptographic assets from the blockchain index. Proceed?`)) {
                                try {
                                  const res = await api.deleteAdminBatch(batch.batch_number);
                                  if (res.success) {
                                    toast({ title: "Index Flushed", description: "Batch assets have been purged from cold storage." });
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
                  </motion.div>
                );
              })}

              <Link href="/admin/coupons/bulk" className="group">
                <div className="h-full border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center py-20 px-10 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-500 bg-slate-50/20">
                  <div className="h-20 w-20 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-orange-500/10 transition-all duration-500">
                    <Plus className="h-10 w-10 text-slate-200 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em] group-hover:text-orange-600 transition-colors">Bulk Injection Profile</p>
                  <p className="text-[10px] text-slate-300 mt-2 font-medium">Add new cryptographic inventory shards</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100 py-32 text-center shadow-2xl shadow-slate-200/50">
              <div className="h-28 w-28 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-white">
                <FileCheck className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase">No Coupons <span className="text-slate-300">Found</span></h3>
              <p className="text-slate-400 max-w-sm mx-auto mb-12 font-medium leading-relaxed">Please upload a spreadsheet file to add coupons and rewards to the system.</p>
              <Link href="/admin/coupons/bulk">
                <Button className="px-14 h-16 rounded-2xl font-black text-lg bg-orange-600 hover:bg-orange-500 text-white shadow-2xl shadow-orange-600/20 transition-all hover:scale-105 active:scale-95 border-0">
                  <Upload className="h-6 w-6 mr-3" />
                  Upload Now
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={viewCouponDialogOpen} onOpenChange={setViewCouponDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-white/80 backdrop-blur-2xl flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col flex-1 min-h-0 bg-white/40"
          >
            {/* Header with decorative background */}
            <div className="relative p-7 border-b border-gray-100/50 overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="h-12 w-12 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg shadow-orange-200 ring-4 ring-white">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
                    Coupon Details
                  </DialogTitle>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">View coupon and scan information</p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden p-6 md:p-8">
              {isFetchingCouponDetails ? (
                <div className="h-full flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
                  </div>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Payload...</p>
                </div>
              ) : selectedCoupon ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 h-full min-h-0">

                  {/* Left Column: Premium Visual Card */}
                  <div className="md:col-span-2 h-full flex flex-col min-h-0">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="group relative h-full flex flex-col justify-between p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-100/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none" />

                      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full min-h-0">
                        <div className="relative w-full h-[380px] overflow-hidden rounded-[2.5rem] bg-white border border-gray-100/50 flex items-center justify-center shadow-inner group shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/10 to-transparent pointer-events-none" />

                          {selectedCoupon.reward_image ? (
                            <img
                              src={selectedCoupon.reward_image}
                              alt="Reward"
                              className="relative z-0 w-full h-full object-cover drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="relative z-10 flex flex-col items-center justify-center text-center p-12">
                              <div className="h-24 w-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-orange-50/50">
                                <Gift className="h-12 w-12 text-orange-200" />
                              </div>
                              <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em]">Intangible Asset</span>
                            </div>
                          )}

                          {selectedCoupon.campaign && (
                            <div className="absolute bottom-6 inset-x-0 flex justify-center z-20">
                              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-600/60 px-6 py-2 bg-white/90 backdrop-blur-md rounded-full border border-orange-100 shadow-sm">
                                {selectedCoupon.campaign}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10 mt-4 shrink-0">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight text-center">
                          {selectedCoupon.reward_name || (selectedCoupon.reward_value ? `₹${selectedCoupon.reward_value}` : '')}
                        </h3>
                      </div>
                    </motion.div>
                  </div>

                  {/* Right Column: Intelligence Grid */}
                  <div className="md:col-span-3 h-full flex flex-col gap-6 overflow-y-auto pr-3 custom-scrollbar min-h-0">

                    {/* Core Identity Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-1 rounded-full bg-orange-500"></div>
                          <h4 className="text-sm font-black uppercase text-gray-900 tracking-[0.15em]">Coupon Details</h4>
                        </div>
                        <Badge variant={selectedCoupon.is_used ? "secondary" : "success"} className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-0 shadow-sm ring-1 ring-gray-100">
                          {selectedCoupon.is_used ? "Used" : "Available"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Coupon Code', value: selectedCoupon.code, mono: true, emphasis: true },
                          { label: 'Secret Key', value: selectedCoupon.auth_code, mono: true, accent: true },
                          { label: 'File ID', value: selectedCoupon.batch_number || "GEN-001", mono: true },
                          { label: 'Status', value: selectedCoupon.status === 'USED' ? 'Used' : 'Available', status: true }
                        ].map((item, idx) => (
                          <div key={idx} className="group p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300">
                            <span className="text-gray-400 block mb-1.5 uppercase tracking-widest text-[9px] font-black group-hover:text-orange-400 transition-colors">{item.label}</span>
                            <span className={`
                              block truncate
                              ${item.mono ? 'font-mono' : 'font-bold'}
                              ${item.emphasis ? 'text-lg font-black tracking-tight text-gray-900' : 'text-sm font-bold text-gray-700'}
                              ${item.accent ? 'text-orange-600' : ''}
                            `}>
                              {item.value || '---'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Redemption Intelligence Section */}
                    {selectedCoupon.redeemed_by && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-1 rounded-full bg-blue-500"></div>
                          <h4 className="text-sm font-black uppercase text-gray-900 tracking-[0.15em]">Customer Info</h4>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-[2rem] border border-blue-100/30 relative overflow-hidden">
                          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
                            <Activity className="h-32 w-32 text-blue-900" />
                          </div>

                          <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                              <div className="relative h-14 w-14 group">
                                <div className="absolute inset-0 bg-blue-400/20 rounded-2xl blur-lg animate-pulse" />
                                {selectedCoupon.redeemed_by.image ? (
                                  <img src={selectedCoupon.redeemed_by.image} className="h-full w-full rounded-2xl object-cover border-2 border-white shadow-md relative z-10" />
                                ) : (
                                  <div className="h-full w-full rounded-2xl bg-white shadow-md border-2 border-white flex items-center justify-center font-black text-xl text-blue-600 relative z-10">
                                    {selectedCoupon.redeemed_by.name?.[0] || "U"}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-lg font-black text-blue-900 tracking-tight">{selectedCoupon.redeemed_by.name || "System User"}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] font-bold text-blue-500 flex items-center gap-1 bg-blue-100/50 px-3 py-0.5 rounded-full">
                                    {selectedCoupon.redeemed_by.phone_number || selectedCoupon.redeemed_by.phone || "---"}
                                  </span>
                                  {selectedCoupon.is_used && (
                                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <FileCheck className="h-3 w-3" /> Success
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {selectedCoupon.used_at && (
                                <>
                                  <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm">
                                    <span className="text-blue-400 block mb-1 uppercase tracking-widest text-[9px] font-black">Scanned On</span>
                                    <span className="text-sm text-blue-900 font-bold block">
                                      {new Date(selectedCoupon.used_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm">
                                    <span className="text-blue-400 block mb-1 uppercase tracking-widest text-[9px] font-black">Verification Time</span>
                                    <span className="text-sm text-blue-900 font-bold block">
                                      {new Date(selectedCoupon.used_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setViewCouponDialogOpen(false)}
                className="px-8 rounded-2xl h-12 font-black text-gray-500 hover:text-gray-900 hover:bg-white border-gray-200 shadow-sm transition-all hover:shadow-lg active:scale-95"
              >
                Close Details
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>


      {/* Create Campaign Dialog */}
      <Dialog open={createCampaignDialogOpen} onOpenChange={setCreateCampaignDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden shadow-2xl border-0 rounded-[2.5rem] p-0 bg-white/80 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative flex flex-col h-full max-h-[90vh]"
          >
            {/* Header with decorative background */}
            <div className="relative p-8 border-b border-slate-100/50 overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="h-14 w-14 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg shadow-orange-200 ring-4 ring-white shrink-0">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingCampaignId ? "Edit Offer" : "Start New Offer"}
                  </DialogTitle>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">Set up rewards and total number of coupons</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Name *</Label>
                  <Input
                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm font-bold text-slate-900 placeholder:text-slate-300 px-6"
                    placeholder="e.g., Diwali Monsoon Rewards 2026"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="date"
                      className="h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900 transition-all focus:bg-white"
                      value={campaignForm.start_date}
                      onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expires On</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input
                      type="date"
                      className="h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-900 transition-all focus:bg-white"
                      value={campaignForm.end_date}
                      onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100/50 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-200/20 rounded-full blur-2xl group-hover:bg-blue-300/30 transition-all duration-500" />
                <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <Label className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Inventory Size (Planned Scans) *</Label>
                  </div>
                </div>
                <Input
                  type="number"
                  className="h-14 bg-white border-blue-100 rounded-2xl font-black text-xl text-blue-900 placeholder:text-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all text-center"
                  placeholder="1000"
                  value={campaignForm.total_coupons}
                  onChange={(e) => setCampaignForm({ ...campaignForm, total_coupons: e.target.value })}
                />
                <p className="text-[10px] text-blue-400 mt-4 italic font-medium leading-relaxed bg-white/40 p-2.5 rounded-xl border border-blue-100/50">
                  <Sparkles className="h-3 w-3 inline mr-1 text-blue-400" />
                  Prizes are weight-balanced against this number across all generated codes.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 rounded-full bg-orange-500" />
                    <h4 className="text-sm font-black uppercase text-slate-900 tracking-[0.1em]">Prize Architecture</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 font-black h-10 px-5 shadow-sm active:scale-95 transition-all border-2"
                    onClick={() => setCampaignForm({ ...campaignForm, tiers: [...campaignForm.tiers, { reward_type: "CASHBACK", reward_value: "0", max_winners: "0", image_url: "" }] })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tier
                  </Button>
                </div>

                <div className="space-y-4">
                  {campaignForm.tiers.map((t, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className="p-6 bg-white rounded-[2rem] border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 relative group/tier"
                    >
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Reward Type</Label>
                          <Select value={t.reward_type} onValueChange={(v: "CASHBACK" | "GIFT" | "DISCOUNT") => { const n = [...campaignForm.tiers]; n[i].reward_type = v; setCampaignForm({ ...campaignForm, tiers: n }); }}>
                            <SelectTrigger className="h-12 text-xs font-black rounded-xl bg-slate-50 border-0 shadow-inner px-4 text-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                              <SelectItem value="CASHBACK" className="rounded-xl font-bold py-3">💰 Instant Cashback</SelectItem>
                              <SelectItem value="GIFT" className="rounded-xl font-bold py-3">🎁 Physical Gift</SelectItem>
                              <SelectItem value="DISCOUNT" className="rounded-xl font-bold py-3">🏷️ Reward Discount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                            {t.reward_type === 'GIFT' ? 'Premium Item Name' : 'Reward Value (₹)'}
                          </Label>
                          <Input
                            className="h-12 text-xs font-black rounded-xl bg-slate-50 border-0 shadow-inner px-4 text-slate-900"
                            placeholder={t.reward_type === 'GIFT' ? "e.g., iPhone 15 Pro" : "e.g., 500"}
                            value={t.reward_value}
                            onChange={(e) => { const n = [...campaignForm.tiers]; n[i].reward_value = e.target.value; setCampaignForm({ ...campaignForm, tiers: n }); }}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Total Available Prizes (Winners Limit)</Label>
                          <div className="relative group">
                            <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                            <Input
                              type="number"
                              className="h-12 pl-12 text-xs font-black rounded-xl bg-slate-50 border-0 shadow-inner px-4 text-slate-900"
                              value={t.max_winners}
                              onChange={(e) => { const n = [...campaignForm.tiers]; n[i].max_winners = e.target.value; setCampaignForm({ ...campaignForm, tiers: n }); }}
                            />
                          </div>
                        </div>
                      </div>

                      {t.reward_type === 'GIFT' && (
                        <div className="mt-6 flex items-center gap-5 p-4 bg-orange-50/30 rounded-2xl border border-dashed border-orange-200">
                          <div
                            className="h-20 w-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center cursor-pointer shadow-sm relative group/img overflow-hidden shrink-0"
                            onClick={() => document.getElementById(`up-${i}`)?.click()}
                          >
                            {t.image_url ? (
                              <>
                                <img src={t.image_url} className="h-full w-full object-contain p-2" />
                                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                  <Trash2 className="h-5 w-5 text-white" />
                                </div>
                              </>
                            ) : (
                              uploadingTierIndex === i ? (
                                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                              ) : (
                                <ImagePlus className="h-8 w-8 text-slate-200 group-hover:text-orange-400 transition-colors" />
                              )
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Asset Content</p>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">High-quality mockups improve conversion rates when users discover their rewards.</p>
                          </div>
                          <input type="file" id={`up-${i}`} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])} />
                        </div>
                      )}

                      {campaignForm.tiers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 absolute -top-3 -right-3 bg-white border border-slate-100 shadow-xl rounded-full text-slate-300 hover:text-red-500 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/tier:opacity-100"
                          onClick={() => { const n = [...campaignForm.tiers]; n.splice(i, 1); setCampaignForm({ ...campaignForm, tiers: n }); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Intelligence Summary */}
              <div className="p-6 bg-slate-900 text-white rounded-[2rem] border border-slate-800 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                  <Activity className="h-40 w-40 text-orange-500" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/40 shrink-0">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Algorithmic Hit Rate</p>
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-black text-white tracking-tighter">
                        {((campaignForm.tiers.reduce((acc, t) => acc + (parseInt(t.max_winners) || 0), 0) / (parseInt(campaignForm.total_coupons) || 1)) * 100).toFixed(1)}%
                      </p>
                      <div className="flex flex-col mb-1.5">
                        <span className="text-[10px] font-black uppercase text-orange-200/50 tracking-tight leading-none italic">Probability</span>
                        <span className="text-[10px] font-bold text-slate-500 tracking-tight leading-none mt-1">Winning Factor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 shrink-0">
              <Button
                variant="ghost"
                className="rounded-2xl h-14 font-black text-slate-400 hover:text-slate-900 px-10 order-2 sm:order-1 transition-all"
                onClick={() => setCreateCampaignDialogOpen(false)}
              >
                Discard Draft
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-500 text-white rounded-2xl flex-1 h-14 font-black shadow-xl shadow-orange-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
                onClick={handleSubmitCampaign}
                disabled={isCreatingCampaign || !campaignForm.name}
              >
                {isCreatingCampaign ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                ) : (
                  editingCampaignId ? <RefreshCw className="h-5 w-5 mr-3" /> : <Rocket className="h-5 w-5 mr-3" />
                )}
                {editingCampaignId ? "Synchronize Updates" : "Deploy Campaign Architecture"}
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

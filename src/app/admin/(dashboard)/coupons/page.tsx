"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Ticket,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Generate form state - matches backend API
  const [generateForm, setGenerateForm] = useState({
    campaign_id: "",      // REQUIRED
    count: "100",         // Number of coupons
    product_id: "",       // Optional
    prefix: "",           // Optional
    expiry_date: "",      // Optional
  });

  // Campaign form state
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
    // Single tier for simplicity
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
        // Handle different response structures
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
        setGenerateDialogOpen(false);
        setGenerateForm({
          campaign_id: "",
          count: "100",
          product_id: "",
          prefix: "",
          expiry_date: "",
        });
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
        tiers: [
          {
            tier_name: campaignForm.tier_name || "Default Tier",
            reward_name: campaignForm.reward_name || `₹${campaignForm.reward_value} ${campaignForm.reward_type}`,
            reward_type: campaignForm.reward_type,
            reward_value: parseInt(campaignForm.reward_value),
            probability: parseFloat(campaignForm.probability) || 1,
            priority: 1,
          }
        ],
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Campaign created successfully! You can now generate coupons.",
        });
        setCreateCampaignDialogOpen(false);
        setCampaignForm({
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coupons Management</h1>
          <p className="text-muted-foreground">Manage, generate, and track all promotional coupons.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateCampaignDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
          <Button onClick={() => setGenerateDialogOpen(true)}>
            <Ticket className="h-4 w-4 mr-2" />
            Generate Coupons
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => fetchCoupons()} variant="secondary">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Coupons Section */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>COUPON CODE</TableHead>
                  <TableHead>PRODUCT</TableHead>
                  <TableHead>REWARD</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>USER</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                      <TableCell>{coupon.product?.name || "-"}</TableCell>
                      <TableCell>
                        {coupon.reward_type === "CASHBACK" && `₹${coupon.reward_value} Cashback`}
                        {coupon.reward_type === "DISCOUNT" && `${coupon.reward_value}% Off`}
                        {coupon.reward_type === "GIFT" && "Free Gift"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.is_used ? "secondary" : "success"}>
                          {coupon.is_used ? "Used" : "Unused"}
                        </Badge>
                      </TableCell>
                      <TableCell>{coupon.redeemed_by?.name || "-"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="text-primary"
                          onClick={() => {
                            toast({
                              title: "Coupon Details",
                              description: `Code: ${coupon.code}\nProduct: ${coupon.product?.name || "N/A"}\nReward: ${coupon.reward_type} - ${coupon.reward_value}\nStatus: ${coupon.is_used ? "Used" : "Unused"}\nRedeemed by: ${coupon.redeemed_by?.name || "N/A"}`,
                            });
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No coupons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCoupons.length} of {total} results
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            &lt;
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
            <Button 
              key={p}
              variant="outline" 
              size="sm" 
              className={page === p ? "bg-primary text-white" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button 
            variant="outline" 
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            &gt;
          </Button>
        </div>
      </div>

      {/* Generate Coupon Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Coupons</DialogTitle>
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
                    campaigns.map((campaign) => {
                      // Get reward summary from tiers
                      const tiersSummary = campaign.tiers?.length 
                        ? campaign.tiers.map(t => `${t.reward_type}: ₹${t.reward_value}`).join(', ')
                        : 'No tiers';
                      return (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name} {campaign.is_active ? '' : '(Inactive)'}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-campaigns" disabled>
                      No campaigns available - Create one first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {campaigns.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No campaigns found. Please create a campaign first before generating coupons.
                </p>
              )}
              {campaigns.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  The reward tiers come from the selected campaign
                </p>
              )}
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
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code Prefix (Optional)</Label>
              <Input 
                placeholder="e.g., AGRI, SUMMER" 
                className="mt-1"
                value={generateForm.prefix}
                onChange={(e) => setGenerateForm({ ...generateForm, prefix: e.target.value.toUpperCase() })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional prefix for coupon codes (e.g., AGRI-XXXX)
              </p>
            </div>
            <div>
              <Label>Expiry Date (Optional)</Label>
              <Input 
                type="date" 
                className="mt-1"
                value={generateForm.expiry_date}
                onChange={(e) => setGenerateForm({ ...generateForm, expiry_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateCoupons} disabled={isGenerating || !generateForm.campaign_id}>
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Ticket className="h-4 w-4 mr-2" />
              Generate Coupons
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={createCampaignDialogOpen} onOpenChange={setCreateCampaignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
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
                placeholder="e.g., गर्मी की बिक्री 2026" 
                className="mt-1"
                value={campaignForm.name_hi}
                onChange={(e) => setCampaignForm({ ...campaignForm, name_hi: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  className="mt-1"
                  value={campaignForm.start_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  className="mt-1"
                  value={campaignForm.end_date}
                  onChange={(e) => setCampaignForm({ ...campaignForm, end_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Reward Tier</h4>
              <div className="space-y-3">
                <div>
                  <Label>Tier Name</Label>
                  <Input 
                    placeholder="e.g., Gold Tier, Silver Tier" 
                    className="mt-1"
                    value={campaignForm.tier_name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, tier_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Reward Type *</Label>
                  <Select 
                    value={campaignForm.reward_type}
                    onValueChange={(value: "CASHBACK" | "DISCOUNT" | "GIFT") => setCampaignForm({ ...campaignForm, reward_type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASHBACK">Cashback</SelectItem>
                      <SelectItem value="DISCOUNT">Discount</SelectItem>
                      <SelectItem value="GIFT">Free Gift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reward Value (₹) *</Label>
                  <Input 
                    type="number"
                    placeholder="e.g., 100" 
                    className="mt-1"
                    value={campaignForm.reward_value}
                    onChange={(e) => setCampaignForm({ ...campaignForm, reward_value: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Reward Name</Label>
                  <Input 
                    placeholder="e.g., ₹100 Cashback (auto-generated if empty)" 
                    className="mt-1"
                    value={campaignForm.reward_name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, reward_name: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCampaignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={isCreatingCampaign || !campaignForm.name}>
              {isCreatingCampaign && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

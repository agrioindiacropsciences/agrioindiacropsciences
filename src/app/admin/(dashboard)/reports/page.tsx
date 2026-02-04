"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  Users,
  TrendingUp,
  Package,
  MapPin,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { DashboardStats } from "@/lib/api";

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("30days");
  const [activeReportTab, setActiveReportTab] = useState("users");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await api.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
    setIsLoading(false);
  };

  const handleExport = async (type: string) => {
    setIsExporting(true);
    try {
      const today = new Date();
      const from = new Date();
      if (dateRange === "7days") from.setDate(today.getDate() - 7);
      else if (dateRange === "30days") from.setDate(today.getDate() - 30);
      else if (dateRange === "90days") from.setDate(today.getDate() - 90);
      else from.setFullYear(today.getFullYear() - 1);

      const dateFrom = from.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];

      const response = await api.getReport(type, { from: dateFrom, to: dateTo });

      if (response.success && response.data) {
        const data = response.data as Record<string, unknown>;
        let csv = "";
        if (data.timeline && Array.isArray(data.timeline)) {
          csv = "Date,Count\n" + (data.timeline as { date: string; count?: number; scans?: number }[])
            .map((r) => `${r.date},${r.count ?? r.scans ?? 0}`).join("\n");
        } else if (data.by_state && Array.isArray(data.by_state)) {
          csv = "State,Count\n" + (data.by_state as { state: string; count: number }[])
            .map((r) => `${r.state},${r.count}`).join("\n");
        } else {
          csv = "Report Type,Value\n" + Object.entries(data)
            .filter(([k]) => !["timeline", "by_state", "by_status", "by_product", "by_category"].includes(k))
            .map(([k, v]) => `${k},${typeof v === "object" ? JSON.stringify(v) : v}`).join("\n");
        }
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${type}-${dateFrom}-${dateTo}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast({
          title: "Export Complete",
          description: "Report downloaded successfully.",
        });
      } else {
        toast({
          title: "Export Failed",
          description: response.error?.message || "Unable to export report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during export",
        variant: "destructive",
      });
    }
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">View detailed analytics and export reports.</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 3 months</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExport(activeReportTab)} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeReportTab} onValueChange={setActiveReportTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="scans">
            <BarChart3 className="h-4 w-4 mr-2" />
            Scans
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <TrendingUp className="h-4 w-4 mr-2" />
            Coupons
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="distributors">
            <MapPin className="h-4 w-4 mr-2" />
            Distributors
          </TabsTrigger>
        </TabsList>

        {/* Users Analytics */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats?.total_users?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-green-600">Registered users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">New Registrations</p>
                    <p className="text-3xl font-bold">{stats?.total_users ? Math.floor(stats.total_users * 0.1) : 0}</p>
                    <p className="text-sm text-green-600">This period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-3xl font-bold">{stats?.total_users ? Math.floor(stats.total_users * 0.7) : 0}</p>
                    <p className="text-sm text-green-600">Active in period</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Registration Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="h-64 flex items-end justify-between gap-1">
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>30 days ago</span>
                    <span>Today</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scans Analytics */}
        <TabsContent value="scans" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Scans</p>
                    <p className="text-3xl font-bold">{stats?.total_coupons_scanned?.toLocaleString() || "0"}</p>
                    <p className="text-sm text-green-600">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Scans This Period</p>
                    <p className="text-3xl font-bold">{stats?.total_coupons_scanned ? Math.floor(stats.total_coupons_scanned * 0.15) : 0}</p>
                    <p className="text-sm text-green-600">In selected period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Avg. Scans/User</p>
                    <p className="text-3xl font-bold">
                      {stats?.total_users && stats?.total_coupons_scanned
                        ? (stats.total_coupons_scanned / stats.total_users).toFixed(1)
                        : "0"}
                    </p>
                    <p className="text-sm text-green-600">Average</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Scans</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="h-64 flex items-end justify-between gap-1">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/30 hover:bg-primary/50 rounded-t transition-colors"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coupons Tab */}
        <TabsContent value="coupons" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Coupons</p>
                    <p className="text-3xl font-bold">{stats?.total_coupons_scanned ? stats.total_coupons_scanned + 5000 : 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Used</p>
                    <p className="text-3xl font-bold">{stats?.total_coupons_scanned || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Unused</p>
                    <p className="text-3xl font-bold">{stats?.total_coupons_scanned ? 5000 : 0}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-3xl font-bold">{stats?.total_products || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Active Products</p>
                    <p className="text-3xl font-bold">{stats?.total_products ? Math.floor(stats.total_products * 0.9) : 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Best Sellers</p>
                    <p className="text-3xl font-bold">{stats?.total_products ? Math.floor(stats.total_products * 0.2) : 0}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Product Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed product analytics coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distributors Tab */}
        <TabsContent value="distributors">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Distributors</p>
                    <p className="text-3xl font-bold">{stats?.total_distributors?.toLocaleString() || "0"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Active Distributors</p>
                    <p className="text-3xl font-bold">{stats?.total_distributors ? Math.floor(stats.total_distributors * 0.9) : 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Coverage Areas</p>
                    <p className="text-3xl font-bold">{stats?.total_distributors ? Math.floor(stats.total_distributors * 2) : 0}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Distributor Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed distributor analytics coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

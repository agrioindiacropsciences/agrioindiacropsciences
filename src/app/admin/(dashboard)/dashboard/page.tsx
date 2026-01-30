"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Ticket,
  IndianRupee,
  TrendingUp,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { DashboardStats, AdminUser } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

function StatCardSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { admin } = useAdminStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.getDashboardStats(),
          api.getAdminUsers({ page: 1, limit: 5 }),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (usersRes.success && usersRes.data) {
          setRecentUsers(usersRes.data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.total_users?.toLocaleString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Coupons Scanned",
      value: stats?.total_coupons_scanned?.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.total_revenue || 0),
      change: "+23.1%",
      trend: "up",
      icon: IndianRupee,
      gradient: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Total Products",
      value: stats?.total_products?.toLocaleString() || "0",
      change: "+4.3%",
      trend: "up",
      icon: Package,
      gradient: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  const quickStats = [
    {
      title: "Active Campaigns",
      value: stats?.total_orders?.toLocaleString() || "5",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Today's Scans",
      value: "124",
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Conversion Rate",
      value: "68%",
      icon: BarChart3,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {admin?.name || "Admin"}
            </h1>
            <p className="text-slate-400 text-sm max-w-md">
              Here's what's happening with your platform today.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-xl p-3 hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-slate-300" />
                  <span className="text-lg font-bold">{stat.value}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{stat.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </>
        ) : (
          statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {stat.trend === "up" ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-gray-400">vs last month</span>
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Stats - Mobile */}
      <div className="grid grid-cols-3 gap-3 sm:hidden">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Recent Users
          </h2>
          <Badge variant="secondary" className="text-xs">
            Last 5 signups
          </Badge>
        </div>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Signup Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user, index) => (
                    <motion.tr
                      key={user.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-emerald-500/20 text-primary font-semibold">
                              {user.name?.split(" ").map((n) => n[0]).join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{user.email || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-primary font-medium">
                        +91 {user.phone_number}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {user.created_at ? formatDate(user.created_at) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "ADMIN" ? "default" : "success"}
                          className="font-medium"
                        >
                          {user.role || "USER"}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

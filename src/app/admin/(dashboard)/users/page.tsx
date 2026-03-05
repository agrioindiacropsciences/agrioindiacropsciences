"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Phone,
  MapPin,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Filter,
  Trash2,
  Gift,
  Calendar,
  Clock,
  CreditCard,
  Star,
  ChevronLeft,
  ChevronRight,
  Mail,
  Globe,
  Sprout,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AdminUser } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminUsers({
        page,
        limit: 10,
        query: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        if (response.data.pagination) {
          const pag = response.data.pagination as unknown as Record<string, number>;
          const pages = pag.totalPages ?? pag.total_pages ?? 1;
          setTotalPages(pages);
          setTotal(pag.total ?? 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setIsLoading(false);
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && user.role !== "SUSPENDED") ||
        (statusFilter === "suspended" && user.role === "SUSPENDED");
      return matchesStatus;
    });
  }, [users, statusFilter]);

  const activeCount = users.filter(u => u.role !== "SUSPENDED").length;
  const suspendedCount = users.filter(u => u.role === "SUSPENDED").length;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await api.exportUsers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "User data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Unable to export users.",
        variant: "destructive",
      });
    }
    setIsExporting(false);
  };

  const handleUpdateStatus = async (userId: string, isActive: boolean) => {
    setStatusUpdatingId(userId);
    try {
      const response = await api.updateUserStatus(userId, isActive);
      if (response.success) {
        toast({
          title: "Success",
          description: `User ${isActive ? "activated" : "suspended"} successfully.`,
        });
        await fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update user status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setStatusUpdatingId(null);
    }

  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        toast({
          title: "User Deleted",
          description: "User has been permanently deleted.",
        });
        await fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const openUserDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setDetailsOpen(true);
    setIsDetailLoading(true);

    try {
      const response = await api.getAdminUserDetails(user.id);
      if (response.success && response.data) {
        setSelectedUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast({
        title: "Error",
        description: "Failed to load user details.",
        variant: "destructive",
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Helper to get page numbers for pagination
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLAIMED':
      case 'VERIFIED':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Claimed</Badge>;
      case 'PENDING_VERIFICATION':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPrizeTypeIcon = (type: string) => {
    switch (type) {
      case 'CASHBACK': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'GIFT': return <Gift className="h-4 w-4 text-purple-600" />;
      case 'DISCOUNT': return <Star className="h-4 w-4 text-orange-600" />;
      case 'POINTS': return <Star className="h-4 w-4 text-blue-600" />;
      default: return <Gift className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatRewardDisplay = (r: { tier_name?: string | null; prize_type: string; prize_value: number }) => {
    const name = r.tier_name || r.prize_type;
    if (r.prize_value > 0) {
      return `${name} · ₹${r.prize_value}`;
    }
    // For GIFT with 0 value, just show the name (it's a free product)
    return name;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
                <p className="text-white/70 text-sm">Manage all registered users</p>
              </div>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Users
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{total}</p>
              <p className="text-xs text-white/70">Total Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{activeCount}</p>
              <p className="text-xs text-white/70">Active</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{suspendedCount}</p>
              <p className="text-xs text-white/70">Suspended</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
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
                  placeholder="Search by name or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-11 h-11 bg-gray-50 border-gray-200"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary" className="h-11">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Active
                    </div>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-600" />
                      Suspended
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
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
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Mobile</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Scans</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/10">
                              {user.profile_image_url ? (
                                <AvatarImage
                                  src={user.profile_image_url}
                                  alt={user.name || user.full_name || "User"}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary font-semibold text-sm">
                                {user.name?.split(" ").map((n) => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || user.full_name || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{user.email || "-"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-primary font-medium">+91 {user.phone_number}</TableCell>
                        <TableCell className="text-gray-600">{user.pincode || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {user.total_scans || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "SUSPENDED" ? "destructive" : "success"}>
                            {user.role === "SUSPENDED" ? "Suspended" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {user.created_at ? formatDate(user.created_at) : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openUserDetails(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.role !== "SUSPENDED" ? (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleUpdateStatus(user.id, false);
                                  }}
                                  disabled={statusUpdatingId === user.id}
                                >
                                  {statusUpdatingId === user.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Ban className="h-4 w-4 mr-2" />
                                  )}
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleUpdateStatus(user.id, true);
                                  }}
                                  disabled={statusUpdatingId === user.id}
                                >
                                  {statusUpdatingId === user.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleDeleteUser(user.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No users found</p>
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
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} · Showing {filteredUsers.length} of {total} users
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            {getPageNumbers().map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  className="min-w-[36px]"
                  onClick={() => setPage(p)}
                  disabled={isLoading}
                >
                  {p}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-6 p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg ring-2 ring-primary/10">
                  {selectedUser.profile_image_url ? (
                    <AvatarImage
                      src={selectedUser.profile_image_url}
                      alt={selectedUser.name || selectedUser.full_name || "User"}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-2xl font-bold">
                    {selectedUser.name?.split(" ").map((n) => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name || selectedUser.full_name || "Unknown"}</h3>
                    <Badge variant={selectedUser.is_active === false ? "destructive" : "success"}
                      className="text-xs">
                      {selectedUser.is_active === false ? "Inactive" : "Active"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>+91 {selectedUser.phone_number || "N/A"}</span>
                    </div>
                    {selectedUser.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedUser.email}</span>
                      </div>
                    )}
                    {(selectedUser.pincode || selectedUser.pin_code) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>PIN: {selectedUser.pincode || selectedUser.pin_code}</span>
                      </div>
                    )}
                    {selectedUser.state && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{selectedUser.district ? `${selectedUser.district}, ` : ''}{selectedUser.state}</span>
                      </div>
                    )}
                    {selectedUser.language && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>Language: {selectedUser.language === 'hi' ? 'Hindi' : 'English'}</span>
                      </div>
                    )}
                    {selectedUser.last_login && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Last login: {formatDate(selectedUser.last_login)}</span>
                      </div>
                    )}
                  </div>
                  {selectedUser.crops && selectedUser.crops.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Sprout className="h-4 w-4 text-green-500" />
                      {selectedUser.crops.map((crop) => (
                        <Badge key={crop.id} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {crop.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm bg-blue-50/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.total_scans || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Scans</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-green-50/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedUser.total_rewards || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Rewards Won</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm bg-purple-50/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedUser.created_at ? formatDate(selectedUser.created_at) : "-"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Joined</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="activity">
                <TabsList className="bg-gray-100 w-full">
                  <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                  <TabsTrigger value="rewards" className="flex-1">Rewards</TabsTrigger>
                </TabsList>

                {/* Activity Tab */}
                <TabsContent value="activity" className="mt-4">
                  {isDetailLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedUser.recent_redemptions && selectedUser.recent_redemptions.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedUser.recent_redemptions.map((r) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors border border-gray-100"
                        >
                          <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                            {getPrizeTypeIcon(r.prize_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 text-sm truncate">
                                {formatRewardDisplay(r)}
                              </p>
                              {getStatusBadge(r.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {r.scanned_at ? formatDate(r.scanned_at) : '-'}
                              </span>
                              <span className="text-xs text-gray-400">
                                Code: {r.coupon_code}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-7 w-7 text-gray-300" />
                      </div>
                      <p className="text-gray-400 text-sm">No activity found for this user.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Rewards Tab */}
                <TabsContent value="rewards" className="mt-4">
                  {isDetailLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedUser.recent_redemptions && selectedUser.recent_redemptions.filter(r => r.status === 'CLAIMED' || r.status === 'VERIFIED').length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedUser.recent_redemptions
                        .filter(r => r.status === 'CLAIMED' || r.status === 'VERIFIED')
                        .map((r) => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50/30 border border-green-100 hover:shadow-sm transition-all"
                          >
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Gift className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm">
                                {r.tier_name || r.prize_type}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Code: {r.coupon_code} · {r.scanned_at ? formatDate(r.scanned_at) : '-'}
                              </p>
                            </div>
                            <div className="text-right">
                              {r.prize_value > 0 ? (
                                <p className="text-lg font-bold text-green-600">₹{r.prize_value}</p>
                              ) : (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">Free Gift</Badge>
                              )}
                              <p className="text-xs text-green-500 mt-1">{r.status === 'CLAIMED' ? 'Claimed' : 'Verified'}</p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                      <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Gift className="h-7 w-7 text-gray-300" />
                      </div>
                      <p className="text-gray-400 text-sm">No rewards claimed yet.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

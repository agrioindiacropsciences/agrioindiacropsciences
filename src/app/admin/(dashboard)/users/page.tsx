"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Phone,
  MapPin,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminUsers(page, 10, searchQuery || undefined);
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
    setIsLoading(false);
  }, [page, searchQuery]);

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
    try {
      const response = await api.updateUserStatus(userId, isActive);
      if (response.success) {
        toast({
          title: "Success",
          description: `User ${isActive ? "activated" : "suspended"} successfully.`,
        });
        fetchUsers();
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
    }
  };

  const openUserDetails = async (user: AdminUser) => {
    setSelectedUser(user);
    setDetailsOpen(true);
    
    // Optionally fetch more details
    try {
      const response = await api.getAdminUserDetails(user.id);
      if (response.success && response.data) {
        setSelectedUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage and view all registered users.</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export Users
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              Search
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
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
                <TableRow>
                  <TableHead>USER</TableHead>
                  <TableHead>MOBILE</TableHead>
                  <TableHead>LOCATION</TableHead>
                  <TableHead>SCANS</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>JOINED</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {user.name?.split(" ").map((n) => n[0]).join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || user.full_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{user.email || user.phone_number || "-"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>+91 {user.phone_number}</TableCell>
                      <TableCell>{user.pincode || "-"}</TableCell>
                      <TableCell>{user.total_scans || 0}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "SUSPENDED" ? "destructive" : "success"}>
                          {user.role === "SUSPENDED" ? "Suspended" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.created_at ? formatDate(user.created_at) : "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                                onClick={() => handleUpdateStatus(user.id, false)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-green-600"
                                onClick={() => handleUpdateStatus(user.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
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
          Showing {filteredUsers.length} of {total} users
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
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
            Next
          </Button>
        </div>
      </div>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-white text-2xl">
                    {selectedUser.name?.split(" ").map((n) => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{selectedUser.name || selectedUser.full_name || "Unknown"}</h3>
                    <Badge variant={selectedUser.is_active === false ? "destructive" : "success"}>
                      {selectedUser.is_active === false ? "Inactive" : "Active"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>+91 {selectedUser.phone_number || "N/A"}</span>
                    </div>
                    {selectedUser.pincode && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>PIN: {selectedUser.pincode}</span>
                      </div>
                    )}
                    {selectedUser.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedUser.email}</span>
                      </div>
                    )}
                    {selectedUser.full_address && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedUser.full_address}</span>
                      </div>
                    )}
                    {selectedUser.state && selectedUser.district && (
                      <div className="flex items-center gap-2 col-span-2">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{selectedUser.district}, {selectedUser.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedUser.total_scans || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Scans</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedUser.total_rewards || 0}</p>
                    <p className="text-sm text-muted-foreground">Rewards Won</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {selectedUser.created_at ? formatDate(selectedUser.created_at) : "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">Joined</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="activity">
                <TabsList>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="rewards">Rewards</TabsTrigger>
                </TabsList>
                <TabsContent value="activity" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    User activity history will be displayed here.
                  </p>
                </TabsContent>
                <TabsContent value="rewards" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">
                    User rewards history will be displayed here.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

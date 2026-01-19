"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Distributor } from "@/lib/api";

export default function DistributorsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDistributors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminDistributors({ page, limit: 10 });
      
      if (response.success && response.data) {
        setDistributors(response.data.distributors || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
    }
    setIsLoading(false);
  }, [page]);

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  const filteredDistributors = useMemo(() => {
    return distributors.filter((dist) => {
      const matchesSearch = dist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dist.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dist.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || 
        (statusFilter === "active" && dist.is_active) ||
        (statusFilter === "inactive" && !dist.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [distributors, searchQuery, statusFilter]);

  const handleCreateDistributor = async () => {
    if (!formData.name || !formData.phone || !formData.pincode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createDistributor({
        name: formData.name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Distributor created successfully",
        });
        setAddDialogOpen(false);
        setFormData({
          name: "",
          owner_name: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          latitude: "",
          longitude: "",
        });
        fetchDistributors();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create distributor",
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
    setIsSubmitting(false);
  };

  const handleDeleteDistributor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this distributor?")) return;

    try {
      const response = await api.deleteDistributor(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Distributor deleted successfully",
        });
        fetchDistributors();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete distributor",
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Distributors Management</h1>
          <p className="text-muted-foreground">Manage all authorized distributors.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Distributor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search distributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Distributors Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DISTRIBUTOR NAME</TableHead>
                  <TableHead>PHONE</TableHead>
                  <TableHead>AREA/PINCODE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributors.length > 0 ? (
                  filteredDistributors.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell>
                        <div className="font-medium">{dist.name}</div>
                        {dist.owner_name && (
                          <div className="text-sm text-muted-foreground">{dist.owner_name}</div>
                        )}
                      </TableCell>
                      <TableCell>{dist.phone || "-"}</TableCell>
                      <TableCell>
                        {dist.city || dist.address ? `${dist.city || dist.address}${dist.pincode ? ` / ${dist.pincode}` : ""}` : dist.pincode || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={dist.is_active ? "success" : "secondary"}
                        >
                          {dist.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // TODO: Implement edit distributor functionality
                              toast({
                                title: "Edit Distributor",
                                description: "Edit functionality coming soon",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleDeleteDistributor(dist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No distributors found
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
          Showing {filteredDistributors.length} of {total}
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

      {/* Add Distributor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Distributor</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Distributor Name *</Label>
              <Input 
                placeholder="Business name" 
                className="mt-1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Owner/Contact Person</Label>
              <Input 
                placeholder="Contact person name" 
                className="mt-1"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input 
                placeholder="+91 XXXXX XXXXX" 
                className="mt-1"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                className="mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Input 
                placeholder="Full address" 
                className="mt-1"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input 
                placeholder="City name" 
                className="mt-1"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label>State</Label>
              <Input 
                placeholder="State name" 
                className="mt-1"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input 
                placeholder="6-digit pincode" 
                className="mt-1"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              />
            </div>
            <div>
              <Label>Latitude (optional)</Label>
              <Input 
                placeholder="e.g., 19.0760" 
                className="mt-1"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div>
              <Label>Longitude (optional)</Label>
              <Input 
                placeholder="e.g., 72.8777" 
                className="mt-1"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDistributor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              Add Distributor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

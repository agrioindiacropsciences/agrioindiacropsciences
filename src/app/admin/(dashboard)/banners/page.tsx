"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
  GripVertical,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Banner } from "@/lib/api";

export default function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    section: "HOME",
    image_url: "",
    image_url_hi: "",
    title: "",
    link_type: "NONE" as "PRODUCT" | "CATEGORY" | "URL" | "NONE",
    link_value: "",
    display_order: 0,
    is_active: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminBanners();
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setBanners(data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      toast({
        title: "Error",
        description: "Failed to load banners",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const resetForm = () => {
    setFormData({
      section: "HOME",
      image_url: "",
      image_url_hi: "",
      title: "",
      link_type: "NONE",
      link_value: "",
      display_order: banners.length,
      is_active: true,
    });
    setSelectedImage(null);
    setImagePreview("");
    setEditingBanner(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image_url: "" }));
    }
    e.target.value = "";
  };

  const handleCreate = async () => {
    if (!selectedImage) {
      toast({
        title: "Validation Error",
        description: "Please select an image file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("section", formData.section);
      fd.append("linkType", formData.link_type);
      fd.append("linkValue", formData.link_value || "");
      fd.append("displayOrder", String(formData.display_order));
      fd.append("isActive", String(formData.is_active));
      if (formData.title) fd.append("title", formData.title);
      if (formData.image_url_hi) fd.append("imageUrlHi", formData.image_url_hi);
      fd.append("image", selectedImage);

      const response = await api.createBanner(fd);

      if (response.success) {
        toast({ title: "Success", description: "Banner created successfully" });
        setCreateDialogOpen(false);
        resetForm();
        fetchBanners();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create banner",
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

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      section: (banner as any).section || "HOME",
      image_url: banner.image_url || "",
      image_url_hi: (banner as any).image_url_hi || "",
      title: banner.title || "",
      link_type: (banner as any).link_type || "NONE",
      link_value: (banner as any).link_value || "",
      display_order: banner.display_order ?? 0,
      is_active: banner.is_active ?? true,
    });
    setSelectedImage(null);
    setImagePreview("");
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingBanner) return;
    if (!selectedImage && !formData.image_url.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select an image or keep the existing one",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image_url", formData.image_url || "");
      fd.append("linkType", formData.link_type);
      fd.append("linkValue", formData.link_value || "");
      fd.append("displayOrder", String(formData.display_order));
      fd.append("isActive", String(formData.is_active));
      if (formData.title) fd.append("title", formData.title);
      if (formData.image_url_hi) fd.append("imageUrlHi", formData.image_url_hi);
      if (selectedImage) {
        fd.append("image", selectedImage);
      }

      const response = await api.updateBanner(editingBanner.id, fd);

      if (response.success) {
        toast({ title: "Success", description: "Banner updated successfully" });
        setEditDialogOpen(false);
        resetForm();
        fetchBanners();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update banner",
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const response = await api.deleteBanner(id);
      if (response.success) {
        toast({ title: "Success", description: "Banner deleted successfully" });
        fetchBanners();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete banner",
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
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Banners Management</h1>
              <p className="text-white/70 text-sm">Manage app home screen banners</p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setCreateDialogOpen(true);
            }}
            className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{banners.length}</p>
            <p className="text-xs text-white/70">Total Banners</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{banners.filter((b) => b.is_active).length}</p>
            <p className="text-xs text-white/70">Active</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-10" />
                    <TableHead className="font-semibold">Preview</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Section</TableHead>
                    <TableHead className="font-semibold">Order</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.length > 0 ? (
                    banners.map((banner) => (
                      <TableRow key={banner.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </TableCell>
                        <TableCell>
                          <div className="relative h-16 w-24 rounded-lg bg-gray-100 overflow-hidden">
                            {banner.image_url ? (
                              <img
                                src={banner.image_url}
                                alt={banner.title || "Banner"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{banner.title || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{(banner as any).section || "HOME"}</Badge>
                        </TableCell>
                        <TableCell>{banner.display_order ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={banner.is_active ? "success" : "secondary"}>
                            {banner.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(banner)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(banner.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No banners yet</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setCreateDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Banner
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(o) => { setCreateDialogOpen(o); resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Section</Label>
              <Select
                value={formData.section}
                onValueChange={(v) => setFormData({ ...formData, section: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOME">Home</SelectItem>
                  <SelectItem value="OFFERS">Offers</SelectItem>
                  <SelectItem value="PRODUCTS">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Banner Image *</Label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                id="create-banner-image"
              />
              <label
                htmlFor="create-banner-image"
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors block bg-gray-50"
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Click to select image from device</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP (max 10MB)</p>
              </label>
              {(imagePreview || formData.image_url) && (
                <div className="mt-3 relative h-24 w-full rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Banner title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Link Type</Label>
              <Select
                value={formData.link_type}
                onValueChange={(v: any) => setFormData({ ...formData, link_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="URL">URL</SelectItem>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="CATEGORY">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.link_type !== "NONE" && (
              <div>
                <Label>Link Value</Label>
                <Input
                  placeholder={formData.link_type === "URL" ? "https://..." : "ID or slug"}
                  value={formData.link_value}
                  onChange={(e) => setFormData({ ...formData, link_value: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting || !selectedImage}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Banner Image *</Label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                id="edit-banner-image"
              />
              <label
                htmlFor="edit-banner-image"
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors block bg-gray-50"
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Click to select new image (or keep current)</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP (max 10MB)</p>
              </label>
              {(imagePreview || formData.image_url) && (
                <div className="mt-3 relative h-24 w-full rounded-lg overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Banner title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Link Type</Label>
              <Select
                value={formData.link_type}
                onValueChange={(v: any) => setFormData({ ...formData, link_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="URL">URL</SelectItem>
                  <SelectItem value="PRODUCT">Product</SelectItem>
                  <SelectItem value="CATEGORY">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.link_type !== "NONE" && (
              <div>
                <Label>Link Value</Label>
                <Input
                  value={formData.link_value}
                  onChange={(e) => setFormData({ ...formData, link_value: e.target.value })}
                />
              </div>
            )}
            <div>
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Images,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Category } from "@/lib/api/types";

interface EditableCategory extends Category {
  display_order?: number;
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<EditableCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EditableCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.getAdminCategories();
        if (res.success && res.data) {
          setCategories(res.data as EditableCategory[]);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [toast]);

  const openEditDialog = (category: EditableCategory) => {
    setSelectedCategory(category);
    setIsActive(category.is_active);
    setDisplayOrder(category.display_order);
    setPreviewUrl(category.image_url || null);
    setSelectedImage(null);
    setDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", selectedCategory.name);
      formData.append("name_hi", selectedCategory.name_hi);
      formData.append("is_active", String(isActive));
      if (typeof displayOrder === "number") {
        formData.append("display_order", String(displayOrder));
      }
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const res = await api.updateAdminCategory(selectedCategory.id, formData);
      if (res.success && res.data) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategory.id ? (res.data as EditableCategory) : cat
          )
        );
        toast({
          title: "Saved",
          description: "Category updated successfully",
        });
        setDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: res.error?.message || "Failed to update category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update category", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <Images className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Categories Images</h1>
              <p className="text-white/80 text-sm">
                Manage category images that appear in the user panel.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Loading categories...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/60">
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Hindi Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <motion.tr
                        key={category.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        <TableCell>
                          <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100 flex items-center justify-center">
                            {category.image_url ? (
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                fill
                                className="object-cover"
                                unoptimized={category.image_url.startsWith("http")}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full text-gray-300">
                                <Images className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-800">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium">
                          {category.name_hi}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {category.product_count} products
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "success" : "secondary"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(category)}
                          >
                            Manage Image
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center p-12 text-gray-500">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Images className="h-5 w-5 text-emerald-600" />
              {selectedCategory ? `Update ${selectedCategory.name}` : "Update Category"}
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">{selectedCategory.name}</p>
                <p className="text-xs text-gray-500">{selectedCategory.name_hi}</p>
              </div>

              <div className="space-y-2">
                <Label>Category Image</Label>

                {previewUrl ? (
                  <div className="relative h-40 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={previewUrl.startsWith("blob:") || previewUrl.startsWith("http")}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(selectedCategory.image_url || null);
                      }}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 p-1.5 rounded-full shadow-sm transition-colors backdrop-blur-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {selectedImage && (
                      <Badge className="absolute bottom-2 right-2 bg-emerald-500 text-white">
                        New
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="category-image"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="category-image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500 font-medium">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG or WEBP (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-order">Display Order</Label>
                  <Input
                    id="category-order"
                    type="number"
                    value={displayOrder ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDisplayOrder(value ? parseInt(value, 10) || 0 : undefined);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 mt-5 rounded-lg border bg-gray-50">
                  <Label className="text-sm font-medium">Active</Label>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


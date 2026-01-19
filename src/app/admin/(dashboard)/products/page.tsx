"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  Package,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { Product, Category } from "@/lib/api";

export default function ProductsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    name_hi: "",
    description: "",
    description_hi: "",
    composition: "",
    dosage: "",
    application_method: "",
    category_id: "",
    suitable_crops: [] as string[],
    target_pests: [] as string[],
    safety_precautions: [] as string[],
    pack_sizes: [] as { size: string; sku: string; mrp: number; selling_price: number }[],
    is_active: true,
    is_best_seller: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getAdminProducts({ page, limit: 10 }),
        api.getCategories(),
      ]);

      if (productsRes.success && productsRes.data) {
        setProducts(productsRes.data.products || []);
        if (productsRes.data.pagination) {
          setTotalPages(productsRes.data.pagination.totalPages);
          setTotal(productsRes.data.pagination.total);
        }
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
    setIsLoading(false);
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name_hi.includes(searchQuery);
      const matchesCategory =
        categoryFilter === "all" || product.category?.id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      name_hi: "",
      description: "",
      description_hi: "",
      composition: "",
      dosage: "",
      application_method: "",
      category_id: "",
      suitable_crops: [],
      target_pests: [],
      safety_precautions: [],
      pack_sizes: [],
      is_active: true,
      is_best_seller: false,
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      name_hi: product.name_hi || "",
      description: product.description || "",
      description_hi: product.description_hi || "",
      composition: product.composition || "",
      dosage: product.dosage || "",
      application_method: product.application_method || "",
      category_id: product.category?.id || "",
      suitable_crops: product.suitable_crops || [],
      target_pests: product.target_pests || [],
      safety_precautions: product.safety_precautions || [],
      pack_sizes: product.pack_sizes || [],
      is_active: product.is_active ?? true,
      is_best_seller: product.is_best_seller ?? false,
    });
    setImagePreviews(product.images || []);
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct || !formData.name || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.name_hi) formDataToSend.append('name_hi', formData.name_hi);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.description_hi) formDataToSend.append('description_hi', formData.description_hi);
      if (formData.composition) formDataToSend.append('composition', formData.composition);
      if (formData.dosage) formDataToSend.append('dosage', formData.dosage);
      if (formData.application_method) formDataToSend.append('application_method', formData.application_method);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('is_active', String(formData.is_active));
      formDataToSend.append('is_best_seller', String(formData.is_best_seller));
      
      if (formData.suitable_crops.length > 0) {
        formDataToSend.append('suitable_crops', JSON.stringify(formData.suitable_crops));
      }
      if (formData.target_pests.length > 0) {
        formDataToSend.append('target_pests', JSON.stringify(formData.target_pests));
      }
      if (formData.safety_precautions.length > 0) {
        formDataToSend.append('safety_precautions', JSON.stringify(formData.safety_precautions));
      }
      if (formData.pack_sizes.length > 0) {
        formDataToSend.append('pack_sizes', JSON.stringify(formData.pack_sizes));
      }

      // Add images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await api.updateProductWithFiles(editingProduct.id, formDataToSend);

      if (response.success) {
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
        setEditDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update product",
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

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.category_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.name_hi) formDataToSend.append('name_hi', formData.name_hi);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.description_hi) formDataToSend.append('description_hi', formData.description_hi);
      if (formData.composition) formDataToSend.append('composition', formData.composition);
      if (formData.dosage) formDataToSend.append('dosage', formData.dosage);
      if (formData.application_method) formDataToSend.append('application_method', formData.application_method);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('is_active', String(formData.is_active));
      formDataToSend.append('is_best_seller', String(formData.is_best_seller));
      
      if (formData.suitable_crops.length > 0) {
        formDataToSend.append('suitable_crops', JSON.stringify(formData.suitable_crops));
      }
      if (formData.target_pests.length > 0) {
        formDataToSend.append('target_pests', JSON.stringify(formData.target_pests));
      }
      if (formData.safety_precautions.length > 0) {
        formDataToSend.append('safety_precautions', JSON.stringify(formData.safety_precautions));
      }
      if (formData.pack_sizes.length > 0) {
        formDataToSend.append('pack_sizes', JSON.stringify(formData.pack_sizes));
      }

      // Add images
      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await api.createProductWithFiles(formDataToSend);

      if (response.success) {
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        setCreateDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create product",
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

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await api.deleteProduct(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        // Remove from local state immediately
        setProducts(products.filter(p => p.id !== id));
        // Refresh data from server
        fetchData();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete product",
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
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">Manage and view all company products.</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
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

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PRODUCT NAME</TableHead>
                  <TableHead>CATEGORY</TableHead>
                  <TableHead>IMAGE</TableHead>
                  <TableHead>BEST SELLING</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="w-10">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.name_hi}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="relative h-10 w-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.is_best_seller ? (
                          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "success" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
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
          Showing {filteredProducts.length} of {total}
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

      {/* Create Product Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">Product Images</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="product-images"
              />
              <label
                htmlFor="product-images"
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors block"
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG or GIF (Multiple images allowed)
                </p>
              </label>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      {preview.startsWith('blob:') || preview.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <Image 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = imagePreviews.filter((_, i) => i !== index);
                          const newImages = selectedImages.filter((_, i) => i !== index);
                          setImagePreviews(newPreviews);
                          setSelectedImages(newImages);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input 
                  id="productName" 
                  placeholder="e.g., Agrio Boost" 
                  className="mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="productNameHi">Product Name (Hindi)</Label>
                <Input 
                  id="productNameHi" 
                  placeholder="e.g., एग्रियो बूस्ट" 
                  className="mt-1"
                  value={formData.name_hi}
                  onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="composition">Technical Composition</Label>
                <Input 
                  id="composition" 
                  placeholder="e.g., NPK 20:20:20" 
                  className="mt-1"
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product's primary uses..."
                  className="mt-1"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div>
              <Label className="mb-2 block">Product Images</Label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="edit-product-images"
              />
              <label
                htmlFor="edit-product-images"
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors block"
              >
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium">Click to upload new images</p>
                <p className="text-xs text-muted-foreground">or drag and drop</p>
              </label>
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      {preview.startsWith('blob:') || preview.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <Image 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const newPreviews = imagePreviews.filter((_, i) => i !== index);
                          const newImages = selectedImages.filter((_, i) => i !== index);
                          setImagePreviews(newPreviews);
                          setSelectedImages(newImages);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-productName">Product Name *</Label>
                <Input 
                  id="edit-productName" 
                  placeholder="e.g., Agrio Boost" 
                  className="mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-productNameHi">Product Name (Hindi)</Label>
                <Input 
                  id="edit-productNameHi" 
                  placeholder="e.g., एग्रियो बूस्ट" 
                  className="mt-1"
                  value={formData.name_hi}
                  onChange={(e) => setFormData({ ...formData, name_hi: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-composition">Technical Composition</Label>
                <Input 
                  id="edit-composition" 
                  placeholder="e.g., NPK 20:20:20" 
                  className="mt-1"
                  value={formData.composition}
                  onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe the product's primary uses..."
                  className="mt-1"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

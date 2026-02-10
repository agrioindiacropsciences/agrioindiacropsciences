"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Sprout,
    Loader2,
    Upload,
    X,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Crop } from "@/lib/api";
import Image from "next/image";

export default function CropsPage() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        name_hi: "",
        is_active: true,
        display_order: 0,
    });

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchCrops = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.getAdminCrops(searchQuery);
            if (response.success && response.data) {
                setCrops(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch crops", error);
            toast({ title: "Error", description: "Failed to fetch crops", variant: "destructive" });
        }
        setIsLoading(false);
    }, [searchQuery, toast]);

    useEffect(() => {
        fetchCrops();
    }, [fetchCrops]);

    const resetForm = () => {
        setFormData({
            name: "",
            name_hi: "",
            is_active: true,
            display_order: 0,
        });
        setSelectedImage(null);
        setPreviewUrl(null);
        setEditingCrop(null);
    };

    const handleCreate = () => {
        resetForm();
        setDialogOpen(true);
    };

    const handleEdit = (crop: Crop) => {
        setEditingCrop(crop);
        setFormData({
            name: crop.name,
            name_hi: crop.name_hi,
            is_active: crop.is_active,
            display_order: crop.display_order || 0,
        });
        setPreviewUrl(crop.image_url || null);
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

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this crop?")) return;
        try {
            const res = await api.deleteCrop(id);
            if (res.success) {
                toast({ title: "Success", description: "Crop deleted successfully" });
                fetchCrops();
            } else {
                toast({ title: "Error", description: res.error?.message || "Failed to delete", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            let res;

            if (selectedImage) {
                // Use FormData if image is selected
                const fd = new FormData();
                fd.append('name', formData.name);
                fd.append('name_hi', formData.name_hi);
                fd.append('is_active', String(formData.is_active));
                fd.append('display_order', String(formData.display_order));
                fd.append('image', selectedImage);

                if (editingCrop) {
                    res = await api.updateCrop(editingCrop.id, fd);
                } else {
                    res = await api.createCrop(fd);
                }
            } else {
                // Use JSON if no image is selected
                const payload = {
                    id: editingCrop?.id,
                    name: formData.name,
                    name_hi: formData.name_hi,
                    is_active: formData.is_active,
                    display_order: formData.display_order,
                    image_url: editingCrop?.image_url // Keep existing URL
                };

                if (editingCrop) {
                    res = await api.updateCrop(editingCrop.id, payload);
                } else {
                    res = await api.createCrop(payload);
                }
            }

            if (res.success) {
                toast({ title: "Success", description: editingCrop ? "Crop updated" : "Crop created" });
                setDialogOpen(false);
                fetchCrops();
            } else {
                toast({ title: "Error", description: res.error?.message || "Operation failed", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
        }
        setIsSubmitting(false);
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                            <Sprout className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Crops Management</h1>
                            <p className="text-white/80 text-sm">Manage crop list for preferences</p>
                        </div>
                    </div>
                    <Button onClick={handleCreate} className="bg-white text-green-700 hover:bg-white/90 shadow-md transform hover:scale-105 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add Crop
                    </Button>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search crops by name..."
                                className="pl-10 h-11 bg-gray-50 border-gray-200"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-0 shadow-md overflow-hidden">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                <p>Loading crops...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Hindi Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {crops.length > 0 ? crops.map((crop, index) => (
                                        <motion.tr
                                            key={crop.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-100">
                                                    {crop.image_url ? (
                                                        <Image
                                                            src={crop.image_url}
                                                            alt={crop.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized={crop.image_url.startsWith('http')}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full w-full bg-green-50 text-green-200">
                                                            <Sprout className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-gray-800">{crop.name}</TableCell>
                                            <TableCell className="text-gray-600 font-medium">{crop.name_hi}</TableCell>
                                            <TableCell>
                                                <Badge variant={crop.is_active ? "success" : "secondary"}>
                                                    {crop.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-500">{crop.display_order}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(crop)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete(crop.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center p-12 text-gray-500">
                                                <div className="flex flex-col items-center">
                                                    <Sprout className="h-10 w-10 text-gray-300 mb-2" />
                                                    <p>No crops found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sprout className="h-5 w-5 text-green-600" />
                            {editingCrop ? "Edit Crop" : "Add New Crop"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="crop-name">Name (English) *</Label>
                                <Input
                                    id="crop-name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Wheat"
                                    className="focus:ring-green-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="crop-name-hi">Name (Hindi)</Label>
                                <Input
                                    id="crop-name-hi"
                                    value={formData.name_hi}
                                    onChange={e => setFormData({ ...formData, name_hi: e.target.value })}
                                    placeholder="e.g. गेहूं"
                                    className="focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Crop Image</Label>

                            {previewUrl ? (
                                <div className="relative h-40 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                        unoptimized={previewUrl.startsWith('blob:') || previewUrl.startsWith('http')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedImage(null);
                                            setPreviewUrl(null);
                                        }}
                                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 p-1.5 rounded-full shadow-sm transition-colors backdrop-blur-sm"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {selectedImage && (
                                        <Badge className="absolute bottom-2 right-2 bg-green-500 text-white">New</Badge>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        id="crop-image"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="crop-image"
                                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50/30 transition-all"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active Status</Label>
                                <p className="text-xs text-muted-foreground">Visible to users in preferences</p>
                            </div>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="display-order">Display Order</Label>
                            <Input
                                id="display-order"
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingCrop ? "Update Crop" : "Create Crop"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

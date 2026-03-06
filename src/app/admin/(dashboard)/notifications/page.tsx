"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Send,
  Loader2,
  Users,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
  Gift,
  ShoppingBag,
  Settings,
  Globe,
  AlertCircle,
  Sparkles,
  UploadCloud,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AdminFcmSendRequest, Crop } from "@/lib/api";

const notificationTypes = [
  {
    value: "SYSTEM",
    label: "System",
    icon: Settings,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    description: "General system notifications",
  },
  {
    value: "PROMO",
    label: "Promotion",
    icon: Sparkles,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    description: "Promotional offers and deals",
  },
];

const topics = [
  { value: "all_users", label: "All Users", icon: Users },
  { value: "farmers", label: "Farmers", icon: Users },
  { value: "dealers", label: "Dealers", icon: Users },
];

const appScreens = [
  { label: "Home Screen", value: "home", description: "Main landing dashboard" },
  { label: "Scan & Win", value: "scan_and_win", description: "Open the QR scanner for rewards" },
  { label: "Products Catalog", value: "products", description: "Explore all agriculture products" },
  { label: "My Rewards", value: "coupons", description: "User's earned coupons and rewards" },
  { label: "Nearby Dealers", value: "distributors", description: "Find nearby Agrio distributors" },
  { label: "Farmer AI Support", value: "ai_chat", description: "AI assistance for farming queries" },
  { label: "Profile Settings", value: "profile", description: "Manage profile and farmer details" },
  { label: "Help & Support", value: "support", description: "Contact customer care and FAQs" },
  { label: "Notification History", value: "notifications", description: "View previous alerts" },
];

export default function NotificationsPage() {
  const { toast } = useToast();

  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [products, setProducts] = useState<api.Product[]>([]);
  const [recentMedia, setRecentMedia] = useState<api.AdminMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Form states
  const [type, setType] = useState<AdminFcmSendRequest["type"]>("SYSTEM");
  const [topic, setTopic] = useState("all_users");
  const [platform, setPlatform] = useState<"all" | "android" | "ios">("all");
  const [registrationPeriod, setRegistrationPeriod] = useState<"all" | "new_users" | "this_month" | "this_year" | "crop_preference">("all");
  const [daysAgo, setDaysAgo] = useState("7");
  const [cropId, setCropId] = useState("all");


  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [message, setMessage] = useState("");
  const [messageHi, setMessageHi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [productId, setProductId] = useState("");

  const fetchMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await api.adminApi.listMedia('notifications', 50);
      if (res.success && res.data) {
        setRecentMedia(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleDeleteMedia = async (publicId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't select the image when deleting
    if (!confirm("Are you sure you want to delete this image?")) return;

    setIsDeletingMedia(true);
    try {
      const res = await api.adminApi.deleteMedia(publicId);
      if (res.success) {
        toast({ title: "Success", description: "Image deleted successfully" });
        fetchMedia(); // Refresh list
        if (imageUrl.includes(publicId.split('/').pop()!)) {
          setImageUrl(""); // Clear if it was selected
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete image", variant: "destructive" });
    } finally {
      setIsDeletingMedia(false);
    }
  };

  useEffect(() => {
    const fetchCrops = async () => {
      const res = await api.cropsApi.getAll();
      if (res.success && res.data) {
        setCrops(res.data);
      }
    };

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await api.adminApi.getProducts({ limit: 100 });
        if (res.success && res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchCrops();
    fetchMedia();
    fetchProducts();
  }, []);

  // Auto-reset crop_preference filter when dealers role is selected
  useEffect(() => {
    if (topic === "dealers" && registrationPeriod === "crop_preference") {
      setRegistrationPeriod("all");
    }
  }, [topic, registrationPeriod]);

  // Handle PROMO type specific logic
  useEffect(() => {
    if (type === "PROMO") {
      // Clear general screen slug if moving to promo
      setSlug("none");
    } else {
      // Clear product ID if moving back to system
      setProductId("");
    }
  }, [type]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const response = await api.uploadMedia(file, "notifications");
      if (response.success && response.data) {
        setImageUrl(response.data.url);
        toast({ title: "Success", description: "Image uploaded successfully" });
        fetchMedia(); // Refresh list
      } else {
        toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const selectedType = notificationTypes.find((t) => t.value === type);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const payload: AdminFcmSendRequest = {
        title: title.trim(),
        body: message.trim(),
        titleHi: titleHi.trim() || undefined,
        messageHi: messageHi.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        topic: topic || "all_users",
        type,
        slug: slug !== "none" ? slug.trim() : undefined,
        productId: productId.trim() || undefined,
        platform: platform !== 'all' ? platform : undefined,
        registrationPeriod: registrationPeriod !== 'all' ? registrationPeriod : undefined,
        daysAgo: registrationPeriod === 'new_users' ? parseInt(daysAgo) || 7 : undefined,
        cropId: registrationPeriod === 'crop_preference' ? cropId : undefined,
      };

      const res = await api.adminSendFcmNotification(payload);

      if (res.success) {
        toast({
          title: "Notification Sent Successfully",
          description: `Notification sent to ${topic === "all_users" ? "all users" : topic} via FCM`,
          variant: "success",
        });

        // Reset form
        setTitle("");
        setTitleHi("");
        setMessage("");
        setMessageHi("");
        setImageUrl("");
        setSlug("");
        setProductId("");
        setType("SYSTEM");
        setTopic("all_users");
        setPlatform("all");
        setRegistrationPeriod("all");
        setDaysAgo("7");
        setCropId("all");
      } else {
        toast({
          title: "Failed to Send",
          description: res.error?.message || "Failed to send notification",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Failed to Send",
        description: "An error occurred while sending the notification",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Send Notifications</h1>
                <p className="text-slate-400 text-sm">Reach all users via push notifications</p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>



      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Compose Notification
            </CardTitle>
            <CardDescription>
              Fill in the details below to send a notification to your users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">


            {/* Target Audience */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Role
                  </Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => {
                        const Icon = t.icon;
                        return (
                          <SelectItem key={t.value} value={t.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {t.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Platform</Label>
                  <Select value={platform} onValueChange={(val: any) => setPlatform(val)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="android">Android Only</SelectItem>
                      <SelectItem value="ios">Apple iOS Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Registration Period</Label>
                  <Select
                    value={registrationPeriod}
                    onValueChange={(val: any) => setRegistrationPeriod(val)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="new_users">Recent Users (Days Ago)</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem
                        value="crop_preference"
                        disabled={topic === "dealers"}
                        className={topic === "dealers" ? "opacity-40 cursor-not-allowed" : ""}
                      >
                        By Crop Preference
                        {topic === "dealers" && (
                          <span className="ml-2 text-[10px] text-rose-500 font-semibold">(Farmers only)</span>
                        )}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {topic === "dealers" && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                      🌾 &quot;By Crop Preference&quot; is not available for Dealers
                    </p>
                  )}
                </div>

                {registrationPeriod === "new_users" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Registered in Last X Days</Label>
                    <Select value={daysAgo} onValueChange={setDaysAgo}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="2">2 Days</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="4">4 Days</SelectItem>
                        <SelectItem value="5">5 Days</SelectItem>
                        <SelectItem value="6">6 Days</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {registrationPeriod === "crop_preference" && topic !== "dealers" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Select Crop</Label>
                    <Select value={cropId} onValueChange={setCropId}>
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Crop</SelectItem>
                        {crops.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.name_hi ? `(${c.name_hi})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Type Selector */}
            <div className="space-y-3 border rounded-xl p-4 bg-gray-50/50">
              <Label className="text-sm font-semibold text-gray-700">Notification Type</Label>
              <div className="flex gap-3 flex-wrap">
                {notificationTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setType(t.value as any);
                        if (t.value === "PROMO") {
                          setSlug("none");
                        } else {
                          setProductId("");
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${isSelected
                        ? `${t.bgColor} ${t.color} border-current shadow-sm`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                      {isSelected && <span className="ml-1 text-[10px] font-bold uppercase tracking-wider opacity-70">Active</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {type === "PROMO" ? "🏷️ Promotional — link to a specific product below" : "🔔 System — general announcement or alert"}
              </p>
            </div>

            {/* Title Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Title (English) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Title (Hindi)</Label>
                <Input
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="अधिसूचना शीर्षक दर्ज करें"
                  className="h-12"
                />
              </div>
            </div>

            {/* Message Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Message (English) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter notification message"
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-semibold">Message (Hindi)</Label>
                <Textarea
                  value={messageHi}
                  onChange={(e) => setMessageHi(e.target.value)}
                  placeholder="अधिसूचना संदेश दर्ज करें"
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Optional Fields
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Notification Image (Optional)
                  </Label>

                  <div className="space-y-6">
                    {/* Current Selection & Upload */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="relative group">
                        <div className={`h-24 w-24 rounded-lg flex items-center justify-center border-2 border-dashed transition-all overflow-hidden ${imageUrl ? 'border-primary bg-primary/5' : 'border-gray-200 bg-gray-50'}`}>
                          {imageUrl ? (
                            <>
                              <img src={imageUrl} alt="preview" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 shadow-md transform hover:scale-110 transition-transform"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-4">
                              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 border border-slate-100/50 shadow-inner">
                                <ImageIcon className="h-5 w-5 text-slate-300" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">No image<br />selected</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <label className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 cursor-pointer h-24 w-32 rounded-lg border-2 border-dashed border-gray-200 transition-all hover:border-primary group">
                        {isUploadingImage ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <UploadCloud className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        )}
                        <span className="text-xs font-medium text-gray-500 group-hover:text-primary">Upload New</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                      </label>

                    </div>

                    {/* Reuse Section */}
                    <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                          Reuse Recent Images
                          {isLoadingMedia && <Loader2 className="h-3 w-3 animate-spin" />}
                        </h4>
                        {recentMedia.length > 5 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/5"
                            onClick={() => setShowAllMedia(true)}
                          >
                            See All ({recentMedia.length})
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        {(isLoadingMedia ? Array(5).fill(0) : recentMedia.slice(0, 5)).map((media, i) => (
                          <div
                            key={isLoadingMedia ? i : media.public_id}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 bg-white ${!isLoadingMedia && imageUrl === media.url ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200'}`}
                            onClick={() => !isLoadingMedia && setImageUrl(media.url)}
                          >
                            {isLoadingMedia ? (
                              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                            ) : (
                              <>
                                <img src={media.url} alt="Recent" className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteMedia(media.public_id, e)}
                                    className="bg-red-500/90 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                    disabled={isDeletingMedia}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                {imageUrl === media.url && (
                                  <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1 shadow-md">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                        {!isLoadingMedia && recentMedia.length === 0 && (
                          <div className="col-span-5 py-8 text-center border rounded-lg border-dashed bg-white text-gray-400 text-xs shadow-inner">
                            No recently uploaded images found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deep Link — mutually exclusive: Product vs Screen */}
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${slug && slug !== "none" ? "opacity-40" : ""}`}>
                    <Package className="h-4 w-4 text-primary" />
                    Select Product {type === "PROMO" && <span className="text-red-500">*</span>}
                    {type === "PROMO" && <span className="ml-1 text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Required for PROMO</span>}
                  </Label>
                  <Select
                    value={productId}
                    onValueChange={(val) => {
                      const selected = val === "none" ? "" : val;
                      setProductId(selected);
                      // Selecting a product clears the screen selector
                      if (selected) setSlug("none");
                    }}
                    disabled={!!(slug && slug !== "none")}
                  >
                    <SelectTrigger className={`h-12 border-amber-200 transition-opacity ${slug && slug !== "none" ? "opacity-40 cursor-not-allowed" : ""}`}>
                      <SelectValue placeholder={isLoadingProducts ? "Loading products..." : "Select a product"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                            <X className="h-4 w-4 text-gray-400" />
                          </div>
                          <span>None / No Product</span>
                        </div>
                      </SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-3 py-0.5">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-50 border border-gray-100 shadow-sm flex-shrink-0">
                              {product.image_url || (product.images && product.images.length > 0) ? (
                                <img
                                  src={product.image_url || product.images[0]}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm leading-none mb-1">{product.name}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1">{product.category?.name || 'General Product'}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {slug && slug !== "none" ? (
                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <span>⚠️</span> Disabled — &quot;Target App Screen&quot; is active. Clear it to select a product.
                    </p>
                  ) : (
                    <p className={`text-xs ${type === "PROMO" ? "text-amber-700 font-medium" : "text-muted-foreground"}`}>
                      {type === "PROMO" ? "✨ Choose a product to link this promotion to" : "Deep-link user directly to this product&apos;s page"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 ${productId || type === "PROMO" ? "opacity-40" : ""}`}>
                    <LinkIcon className="h-4 w-4 text-primary" />
                    Target App Screen
                    {type === "SYSTEM" && <span className="ml-1 text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wide">Recommended for SYSTEM</span>}
                  </Label>
                  <Select
                    value={slug}
                    onValueChange={(val) => {
                      setSlug(val);
                      // Selecting a screen clears the product selector
                      if (val !== "none") setProductId("");
                    }}
                    disabled={!!productId || type === "PROMO"}
                  >
                    <SelectTrigger className={`h-12 transition-opacity ${productId || type === "PROMO" ? "opacity-40 cursor-not-allowed" : ""}`}>
                      <SelectValue placeholder="Select target screen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2 italic text-muted-foreground">
                          <X className="h-4 w-4" />
                          <span>No Specific Screen (Default Home)</span>
                        </div>
                      </SelectItem>
                      {appScreens.map((screen) => (
                        <SelectItem key={screen.value} value={screen.value}>
                          <div className="flex flex-col py-0.5">
                            <span className="font-medium text-sm">{screen.label}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">{screen.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {productId ? (
                    <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <span>⚠️</span> Disabled — a product is selected. Clear it to pick a screen.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Where the user lands after tapping the notification</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {(title || message) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-primary/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-primary">Preview</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    {imageUrl && (
                      <div className="h-16 w-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border">
                        <img src={imageUrl} alt="Notification Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-1 truncate text-base">
                        {title || "Notification Title"}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {message || "Notification message will appear here"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Send Button */}
            <div className="flex items-center justify-between pt-6 border-t mt-4">
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">
                  FCM Push Notification
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Reach: {topic === "all_users" ? "Estimated 50,000+ devices" : `User group: ${topic}`}
                </p>
              </div>
              <Button
                onClick={handleSend}
                disabled={isSending || !title.trim() || !message.trim()}
                size="lg"
                className="min-w-[180px] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gallery Modal */}
      <Dialog open={showAllMedia} onOpenChange={setShowAllMedia}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Notification Image Gallery</DialogTitle>
            <DialogDescription>
              Previously uploaded notification images. Click to select.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {recentMedia.map((media) => (
                <div
                  key={media.public_id}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${imageUrl === media.url ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-primary/50'}`}
                  onClick={() => {
                    setImageUrl(media.url);
                    setShowAllMedia(false);
                  }}
                >
                  <img src={media.url} alt="Gallery" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMedia(media.public_id, e)}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      disabled={isDeletingMedia}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {imageUrl === media.url && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

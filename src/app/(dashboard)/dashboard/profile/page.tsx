"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  User,
  Phone,
  MapPin,
  Leaf,
  Calendar,
  Edit2,
  Save,
  X,
  Download,
  Trash2,
  Globe,
  ScanLine,
  Gift,
  Loader2,
  Upload,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Crop, UserStats } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit pincode"),
  email: z.string().email().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { language, user, setUser, logout } = useStore();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCrops, setIsEditingCrops] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // API data
  const [crops, setCrops] = useState<Crop[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userCrops, setUserCrops] = useState<string[]>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      pincode: user?.pincode || "",
      email: "",
    },
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [profileRes, cropsRes, statsRes, userCropsRes] = await Promise.all([
          api.getProfile(),
          api.getCrops(),
          api.getUserStats(),
          api.getCropPreferences(),
        ]);

        if (profileRes.success && profileRes.data) {
          if (profileRes.data.profile_image_url) {
            setProfileImageUrl(profileRes.data.profile_image_url);
          }
        }

        if (cropsRes.success && cropsRes.data) {
          setCrops(cropsRes.data);
        }

        if (statsRes.success && statsRes.data) {
          setUserStats(statsRes.data);
        }

        if (userCropsRes.success && userCropsRes.data) {
          const cropIds = userCropsRes.data.crop_ids || [];
          setUserCrops(cropIds);
          setSelectedCrops(cropIds);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: language === "en" ? "Invalid File" : "अमान्य फ़ाइल",
        description: language === "en" ? "Please select an image file" : "कृपया एक छवि फ़ाइल चुनें",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === "en" ? "File Too Large" : "फ़ाइल बहुत बड़ी",
        description: language === "en" ? "Image must be less than 5MB" : "छवि 5MB से कम होनी चाहिए",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await api.updateAvatar(file);
      if (response.success && response.data) {
        setProfileImageUrl(response.data.profile_image_url);
        toast({
          title: language === "en" ? "Avatar Updated!" : "अवतार अपडेट हो गया!",
          description: response.data.message || (language === "en" ? "Your profile picture has been updated" : "आपकी प्रोफ़ाइल तस्वीर अपडेट हो गई है"),
          variant: "success",
        });
      } else {
        toast({
          title: language === "en" ? "Error" : "त्रुटि",
          description: response.error?.message || (language === "en" ? "Failed to update avatar" : "अवतार अपडेट करने में विफल"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Something went wrong" : "कुछ गलत हो गया",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    
    try {
      const response = await api.updateProfile({
        full_name: data.name,
        pin_code: data.pincode,
        email: data.email || undefined,
      });
      
      if (response.success && response.data) {
        if (user) {
          setUser({ 
            ...user, 
            name: response.data.full_name || data.name, 
            pincode: response.data.pin_code || data.pincode,
            state: response.data.state || user.state,
            district: response.data.district || user.district,
          });
        }
        
        setIsEditing(false);
        toast({
          title: language === "en" ? "Profile Updated!" : "प्रोफाइल अपडेट हो गई!",
          variant: "success",
        });
      } else {
        toast({
          title: language === "en" ? "Error" : "त्रुटि",
          description: response.error?.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Something went wrong" : "कुछ गलत हो गया",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

  const handleCropToggle = (cropId: string) => {
    setSelectedCrops((prev) =>
      prev.includes(cropId) ? prev.filter((c) => c !== cropId) : [...prev, cropId]
    );
  };

  const saveCropPreferences = async () => {
    setIsSaving(true);
    
    try {
      const response = await api.syncCropPreferences(selectedCrops);
      
      if (response.success) {
        setUserCrops(selectedCrops);
        if (user) {
          setUser({ ...user, cropPreferences: selectedCrops });
        }
        
        setIsEditingCrops(false);
        toast({
          title: language === "en" ? "Crop Preferences Updated!" : "फसल प्राथमिकताएं अपडेट हो गईं!",
          variant: "success",
        });
      } else {
        toast({
          title: language === "en" ? "Error" : "त्रुटि",
          description: response.error?.message || "Failed to update crop preferences",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Something went wrong" : "कुछ गलत हो गया",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    // Note: Account deletion might need a specific API endpoint
    toast({
      title: language === "en" ? "Contact Support" : "सहायता से संपर्क करें",
      description: language === "en"
        ? "Please contact support to delete your account."
        : "कृपया अपना खाता हटाने के लिए सहायता से संपर्क करें।",
    });
    setShowDeleteDialog(false);
  };

  if (!user) return null;

  const stats = [
    {
      label: language === "en" ? "Registration Date" : "पंजीकरण तिथि",
      value: formatDate(user.createdAt),
      icon: Calendar,
    },
    {
      label: language === "en" ? "Total Scans" : "कुल स्कैन",
      value: userStats?.total_scans?.toString() || "0",
      icon: ScanLine,
    },
    {
      label: language === "en" ? "Rewards Won" : "जीते हुए पुरस्कार",
      value: userStats?.coupons_won?.toString() || "0",
      icon: Gift,
    },
    {
      label: language === "en" ? "Total Savings" : "कुल बचत",
      value: `₹${userStats?.total_savings || 0}`,
      icon: User,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {language === "en" ? "My Profile" : "मेरी प्रोफाइल"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Manage your profile information and preferences."
            : "अपनी प्रोफाइल जानकारी और प्राथमिकताएं प्रबंधित करें।"}
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>
              {language === "en" ? "Profile Information" : "प्रोफाइल जानकारी"}
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                {language === "en" ? "Edit" : "संपादित करें"}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); reset(); }}>
                <X className="h-4 w-4 mr-2" />
                {language === "en" ? "Cancel" : "रद्द करें"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                {profileImageUrl ? (
                  <Image 
                    src={profileImageUrl} 
                    alt={user.name} 
                    width={96}
                    height={96}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-3xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isUploadingAvatar}
              />
              <Button
                type="button"
                variant="default"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 p-0 shadow-lg hover:scale-110 transition-transform"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title={language === "en" ? "Change Profile Picture" : "प्रोफ़ाइल तस्वीर बदलें"}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </Button>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-xs font-medium">
                  {language === "en" ? "Click to change" : "बदलने के लिए क्लिक करें"}
                </span>
              </div>
            </div>

            {/* Form / Display */}
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === "en" ? "Full Name" : "पूरा नाम"}
                      </Label>
                      <Input
                        id="name"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">
                        {language === "en" ? "Pincode" : "पिनकोड"}
                      </Label>
                      <Input
                        id="pincode"
                        {...register("pincode")}
                      />
                      {errors.pincode && (
                        <p className="text-sm text-destructive">{errors.pincode.message}</p>
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">
                        {language === "en" ? "Email (Optional)" : "ईमेल (वैकल्पिक)"}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting || isSaving}>
                    {(isSubmitting || isSaving) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {language === "en" ? "Save Changes" : "परिवर्तन सहेजें"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? "Name" : "नाम"}
                        </p>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? "Mobile" : "मोबाइल"}
                        </p>
                        <p className="font-medium">+91 {user.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? "Location" : "स्थान"}
                        </p>
                        <p className="font-medium">
                          {user.district && user.state 
                            ? `${user.district}, ${user.state} - ${user.pincode}`
                            : user.pincode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? "Language" : "भाषा"}
                        </p>
                        <p className="font-medium">
                          {user.language === "en" ? "English" : "हिंदी"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crop Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              {language === "en" ? "Crop Preferences" : "फसल प्राथमिकताएं"}
            </CardTitle>
            {!isEditingCrops ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditingCrops(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                {language === "en" ? "Edit" : "संपादित करें"}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsEditingCrops(false);
                  setSelectedCrops(userCrops);
                }}>
                  <X className="h-4 w-4 mr-2" />
                  {language === "en" ? "Cancel" : "रद्द करें"}
                </Button>
                <Button size="sm" onClick={saveCropPreferences} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {language === "en" ? "Save" : "सहेजें"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          ) : isEditingCrops ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {crops.map((crop) => (
                <label
                  key={crop.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCrops.includes(crop.id)
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    checked={selectedCrops.includes(crop.id)}
                    onCheckedChange={() => handleCropToggle(crop.id)}
                  />
                  <span className="text-sm">
                    {language === "en" ? crop.name : crop.name_hi}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {userCrops.length > 0 ? (
                userCrops.map((cropId) => {
                  const crop = crops.find((c) => c.id === cropId);
                  return (
                    <Badge key={cropId} variant="secondary" className="px-3 py-1">
                      {crop ? (language === "en" ? crop.name : crop.name_hi) : cropId}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">
                  {language === "en" ? "No crops selected" : "कोई फसल नहीं चुनी गई"}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Account Statistics" : "खाता आंकड़े"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-semibold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Account Actions" : "खाता कार्य"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            {language === "en" ? "Download My Data" : "मेरा डेटा डाउनलोड करें"}
          </Button>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                {language === "en" ? "Delete Account" : "खाता हटाएं"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {language === "en" ? "Delete Account?" : "खाता हटाएं?"}
                </DialogTitle>
                <DialogDescription>
                  {language === "en"
                    ? "This action cannot be undone. This will permanently delete your account and remove all your data."
                    : "यह क्रिया पूर्ववत नहीं की जा सकती। यह आपके खाते को स्थायी रूप से हटा देगा और आपके सभी डेटा को हटा देगा।"}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  {language === "en" ? "Cancel" : "रद्द करें"}
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  {language === "en" ? "Delete" : "हटाएं"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

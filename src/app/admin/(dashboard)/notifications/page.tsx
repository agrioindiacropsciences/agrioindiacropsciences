"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AdminFcmSendRequest } from "@/lib/api";

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
  {
    value: "REWARD",
    label: "Reward",
    icon: Gift,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    description: "Rewards and cashback updates",
  },
  {
    value: "ORDER",
    label: "Order",
    icon: ShoppingBag,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    description: "Order status and updates",
  },
  {
    value: "URL",
    label: "Website Link",
    icon: Globe,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    description: "Open a website URL",
  },
];

const topics = [
  { value: "all_users", label: "All Users", icon: Users },
  { value: "farmers", label: "Farmers", icon: Users },
  { value: "dealers", label: "Dealers", icon: Users },
];

export default function AdminNotificationsPage() {
  const { toast } = useToast();

  const [isSending, setIsSending] = useState(false);
  const [type, setType] = useState<AdminFcmSendRequest["type"]>("SYSTEM");
  const [topic, setTopic] = useState("all_users");
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [message, setMessage] = useState("");
  const [messageHi, setMessageHi] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [productId, setProductId] = useState("");
  const [url, setUrl] = useState("");

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

    if (type === "URL" && !url.trim()) {
      toast({
        title: "Validation Error",
        description: "URL is required when notification type is URL.",
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
        slug: slug.trim() || undefined,
        productId: productId.trim() || undefined,
        url: url.trim() || undefined,
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
        setUrl("");
        setType("SYSTEM");
        setTopic("all_users");
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

      {/* Notification Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Notification Type
            </CardTitle>
            <CardDescription>Choose the type of notification you want to send</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {notificationTypes.map((nt) => {
                const Icon = nt.icon;
                const isSelected = type === nt.value;
                return (
                  <motion.button
                    key={nt.value}
                    onClick={() => setType(nt.value as AdminFcmSendRequest["type"])}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg ${nt.bgColor} flex items-center justify-center mb-2`}>
                      <Icon className={`h-5 w-5 ${nt.color}`} />
                    </div>
                    <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-gray-900"}`}>
                      {nt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{nt.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Target Audience
              </Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="h-12">
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

            {/* URL Field (for URL type) */}
            {type === "URL" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <Label className="text-base font-semibold flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-primary" />
                  Website URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.agrioindiacropsciences.com/..."
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Users will be redirected to this URL when they tap the notification
                </p>
              </motion.div>
            )}

            {/* Optional Fields */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Optional Fields
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    Image URL
                  </Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Notification image (displayed in app)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Product ID
                  </Label>
                  <Input
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="product-uuid"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to a specific product (for PROMO type)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Slug / Screen</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="some-slug-or-screen"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Internal routing identifier for the app
                </p>
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
                  <div className="flex items-start gap-3">
                    {selectedType && (
                      <div className={`h-10 w-10 rounded-lg ${selectedType.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <selectedType.icon className={`h-5 w-5 ${selectedType.color}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">
                        {title || "Notification Title"}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message || "Notification message will appear here"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Send Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Notification will be sent via FCM and saved in database
              </p>
              <Button
                onClick={handleSend}
                disabled={isSending || !title.trim() || !message.trim() || (type === "URL" && !url.trim())}
                size="lg"
                className="min-w-[180px]"
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
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Package,
  Gift,
  ShoppingBag,
  Info,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Notification } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotificationsPage() {
  const { language } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getNotifications({ limit: 100 });
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to load notifications" : "सूचनाएं लोड करने में विफल",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, language]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await api.markNotificationRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to mark as read" : "पढ़ा हुआ चिह्नित करने में विफल",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const response = await api.markAllNotificationsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast({
          title: language === "en" ? "Success" : "सफलता",
          description: language === "en" ? "All notifications marked as read" : "सभी सूचनाएं पढ़ी हुई चिह्नित की गईं",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to mark all as read" : "सभी को पढ़ा हुआ चिह्नित करने में विफल",
        variant: "destructive",
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.deleteNotification(id);
      if (response.success) {
        const deleted = notifications.find((n) => n.id === id);
        if (deleted && !deleted.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to delete notification" : "सूचना हटाने में विफल",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(language === "en" ? "Delete all notifications?" : "सभी सूचनाएं हटाएं?")) {
      return;
    }
    setIsDeletingAll(true);
    try {
      const response = await api.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
        toast({
          title: language === "en" ? "Success" : "सफलता",
          description: language === "en" ? "All notifications deleted" : "सभी सूचनाएं हटा दी गईं",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to delete all notifications" : "सभी सूचनाएं हटाने में विफल",
        variant: "destructive",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type and data
    const data = notification.data || {};
    const type = notification.type;

    if (data.url) {
      // Open URL in new tab
      window.open(data.url as string, "_blank");
    } else if (data.productId || data.slug) {
      // Navigate to product page
      const productPath = data.slug
        ? `/products/${data.slug}`
        : `/products/${data.productId}`;
      router.push(productPath);
    } else if (type === "REWARD") {
      // Navigate to rewards page
      router.push("/dashboard/rewards");
    } else if (type === "ORDER") {
      // Navigate to orders page (if exists)
      router.push("/dashboard");
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "REWARD":
        return Gift;
      case "PROMO":
        return Package;
      case "ORDER":
        return ShoppingBag;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "REWARD":
        return "bg-green-500";
      case "PROMO":
        return "bg-orange-500";
      case "ORDER":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return language === "en" ? "Just now" : "अभी";
    } else if (diffMins < 60) {
      return language === "en"
        ? `${diffMins} minutes ago`
        : `${diffMins} मिनट पहले`;
    } else if (diffHours < 24) {
      return language === "en"
        ? `${diffHours} hours ago`
        : `${diffHours} घंटे पहले`;
    } else if (diffDays < 7) {
      return language === "en"
        ? `${diffDays} days ago`
        : `${diffDays} दिन पहले`;
    } else {
      return date.toLocaleDateString(language === "en" ? "en-US" : "hi-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <span>
              {language === "en" ? "Notifications" : "सूचनाएं"}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "en"
              ? "Stay updated with latest updates and offers"
              : "नवीनतम अपडेट और ऑफ़र के साथ अपडेट रहें"}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll || unreadCount === 0}
            >
              {isMarkingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4 mr-2" />
              )}
              {language === "en" ? "Mark All Read" : "सभी पढ़ें"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isDeletingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {language === "en" ? "Delete All" : "सभी हटाएं"}
            </Button>
          </div>
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span className="font-semibold">
              {language === "en"
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : `${unreadCount} अपठित सूचना${unreadCount > 1 ? "एं" : ""}`}
            </span>
          </div>
        </motion.div>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {language === "en" ? "No notifications" : "कोई सूचना नहीं"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "en"
                    ? "You're all caught up! Check back later for updates."
                    : "आप सभी अपडेट हैं! अपडेट के लिए बाद में वापस जांचें।"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const Icon = getTypeIcon(notification.type);
              const imageUrl = notification.data?.imageUrl as string | undefined;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      !notification.is_read
                        ? "border-l-4 border-l-primary bg-primary/5"
                        : "bg-white"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Icon/Image */}
                        {imageUrl ? (
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image
                              src={imageUrl}
                              alt={notification.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`h-16 w-16 rounded-xl ${getTypeColor(
                              notification.type
                            )} flex items-center justify-center flex-shrink-0 shadow-md`}
                          >
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3
                                className={`font-semibold text-lg mb-1 ${
                                  !notification.is_read
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {language === "en"
                                  ? notification.title
                                  : notification.title_hi || notification.title}
                              </h3>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {language === "en"
                                  ? notification.message
                                  : notification.message_hi ||
                                    notification.message}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getTypeColor(
                                  notification.type
                                )} text-white border-0`}
                              >
                                {notification.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {notification.data?.url && typeof notification.data.url === 'string' ? (
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              ) : null}
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

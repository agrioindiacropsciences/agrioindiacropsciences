"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Package,
  Gift,
  ShoppingBag,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Notification } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps) {
  const { language, isAuthenticated } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.getNotifications({ limit: 10, unread_only: false });
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const response = await api.markNotificationRead(id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.markAllNotificationsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast({
          title: language === "en" ? "Success" : "सफलता",
          description:
            language === "en"
              ? "All notifications marked as read"
              : "सभी सूचनाएं पढ़ी हुई चिह्नित की गईं",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description:
          language === "en"
            ? "Failed to mark all as read"
            : "सभी को पढ़ा हुआ चिह्नित करने में विफल",
        variant: "destructive",
      });
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
      onClose();
    } else if (type === "REWARD") {
      // Navigate to rewards page
      router.push("/dashboard/rewards");
      onClose();
    } else if (type === "ORDER") {
      // Navigate to orders page (if exists)
      router.push("/dashboard");
      onClose();
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
        ? `${diffMins}m ago`
        : `${diffMins}मी पहले`;
    } else if (diffHours < 24) {
      return language === "en"
        ? `${diffHours}h ago`
        : `${diffHours}घं पहले`;
    } else if (diffDays < 7) {
      return language === "en"
        ? `${diffDays}d ago`
        : `${diffDays}दि पहले`;
    } else {
      return date.toLocaleDateString(language === "en" ? "en-US" : "hi-IN", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-16 right-4 lg:right-8 w-[90vw] max-w-md bg-white rounded-2xl shadow-2xl z-50 border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-emerald-500/5">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">
                  {language === "en" ? "Notifications" : "सूचनाएं"}
                </h3>
                {unreadCount > 0 && (
                  <Badge className="bg-primary text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    {language === "en" ? "Read All" : "सभी पढ़ें"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en"
                      ? "No notifications"
                      : "कोई सूचना नहीं"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = getTypeIcon(notification.type);
                    const imageUrl = notification.data?.imageUrl as
                      | string
                      | undefined;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.is_read ? "bg-primary/5" : ""
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon/Image */}
                          {imageUrl ? (
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={imageUrl}
                                alt={notification.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className={`h-12 w-12 rounded-lg ${getTypeColor(
                                notification.type
                              )} flex items-center justify-center flex-shrink-0`}
                            >
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4
                                className={`text-sm font-semibold line-clamp-1 ${
                                  !notification.is_read
                                    ? "text-gray-900"
                                    : "text-gray-600"
                                }`}
                              >
                                {language === "en"
                                  ? notification.title
                                  : notification.title_hi || notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {language === "en"
                                ? notification.message
                                : notification.message_hi ||
                                  notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getTypeColor(
                                    notification.type
                                  )} text-white border-0 px-1.5 py-0`}
                                >
                                  {notification.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(notification.created_at)}
                                </span>
                              </div>
                              {notification.data?.url && typeof notification.data.url === 'string' ? (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <Link
                  href="/dashboard/notifications"
                  onClick={onClose}
                  className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  {language === "en"
                    ? "View all notifications"
                    : "सभी सूचनाएं देखें"}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

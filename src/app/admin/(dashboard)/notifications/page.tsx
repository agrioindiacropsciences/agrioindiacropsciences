"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Send,
  Loader2,
  Users,
  User,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { AdminNotification, AdminCreateNotificationRequest } from "@/lib/api";

export default function AdminNotificationsPage() {
  const { toast } = useToast();

  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [type, setType] = useState<AdminCreateNotificationRequest["type"]>("SYSTEM");
  const [target, setTarget] = useState<AdminCreateNotificationRequest["target"]>("ALL");
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [message, setMessage] = useState("");
  const [messageHi, setMessageHi] = useState("");
  const [userIds, setUserIds] = useState(""); // comma separated

  const parsedUserIds = useMemo(() => {
    const ids = userIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(ids));
  }, [userIds]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.adminListNotifications(1, 20);
      if (res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      } else {
        // If backend doesn't support this endpoint yet, show a helpful message
        setNotifications([]);
      }
    } catch (e) {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and message are required.",
        variant: "destructive",
      });
      return;
    }

    if (target === "USER_IDS" && parsedUserIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one user_id (comma separated).",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const payload: AdminCreateNotificationRequest = {
        type,
        title: title.trim(),
        title_hi: titleHi.trim() || undefined,
        message: message.trim(),
        message_hi: messageHi.trim() || undefined,
        target,
        user_ids: target === "USER_IDS" ? parsedUserIds : undefined,
      };

      const res = await api.adminSendNotification(payload);

      if (res.success) {
        toast({
          title: "Notification Sent",
          description:
            target === "ALL"
              ? "Sent to all users."
              : `Sent to ${parsedUserIds.length} users.`,
          variant: "success",
        });

        // Reset compose form
        setTitle("");
        setTitleHi("");
        setMessage("");
        setMessageHi("");
        setUserIds("");

        // Refresh history
        fetchNotifications();
      } else {
        toast({
          title: "Failed to Send",
          description:
            res.error?.message ||
            "Backend endpoint /admin/notifications is not available yet.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Failed to Send",
        description:
          "Backend endpoint /admin/notifications is not available yet.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Send notifications to users (website + app).
          </p>
        </div>
        <Button variant="outline" onClick={fetchNotifications} disabled={isLoading}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                  <SelectItem value="PROMO">PROMO</SelectItem>
                  <SelectItem value="REWARD">REWARD</SelectItem>
                  <SelectItem value="ORDER">ORDER</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> All Users
                    </span>
                  </SelectItem>
                  <SelectItem value="USER_IDS">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Specific Users (IDs)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {target === "USER_IDS" && (
            <div className="space-y-2">
              <Label>User IDs (comma separated)</Label>
              <Input
                placeholder="e.g. 9f3a..., 12ab..., 77cd..."
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Tip: You can copy user IDs from the Users page.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (EN) *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Title (HI)</Label>
              <Input value={titleHi} onChange={(e) => setTitleHi(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Message (EN) *</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Message (HI)</Label>
              <Textarea value={messageHi} onChange={(e) => setMessageHi(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Notification
          </Button>

          <p className="text-xs text-amber-600">
            Note: This requires backend endpoints <span className="font-mono">POST /admin/notifications</span> and{" "}
            <span className="font-mono">GET /admin/notifications</span>. If your backend doesn’t have these yet, the send will fail with 404.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No notifications found (or backend endpoint not available).
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{n.title}</span>
                      <Badge variant="secondary">{n.type}</Badge>
                      {n.is_read === false && <Badge variant="warning">Unread</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


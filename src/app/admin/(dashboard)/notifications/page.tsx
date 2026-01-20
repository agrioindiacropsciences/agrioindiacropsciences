"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  Send,
  Loader2,
  Users,
  User,
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
import type { AdminFcmSendRequest } from "@/lib/api";

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
  const [userIds, setUserIds] = useState(""); // optional targeting hint (backend currently sends to topic)

  const parsedUserIds = useMemo(() => {
    const ids = userIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(ids));
  }, [userIds]);

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
      // Backend admin manual send endpoint: POST /api/v1/fcm/send
      const payload: AdminFcmSendRequest = {
        title: title.trim(),
        body: message.trim(),
        imageUrl: imageUrl.trim() || undefined,
        topic: topic || "all_users",
        type,
        slug: slug.trim() || undefined,
        productId: productId.trim() || undefined,
      };

      const res = await api.adminSendFcmNotification(payload);

      if (res.success) {
        toast({
          title: "Notification Sent",
          description: `Sent via topic: ${topic || "all_users"}`,
          variant: "success",
        });

        // Reset compose form
        setTitle("");
        setTitleHi("");
        setMessage("");
        setMessageHi("");
        setImageUrl("");
        setSlug("");
        setProductId("");
        setUserIds("");
      } else {
        toast({
          title: "Failed to Send",
          description:
            res.error?.message || "Failed to send via /fcm/send",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Failed to Send",
        description: "Failed to send via /fcm/send",
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
              <Label>Topic</Label>
              <Select value={topic} onValueChange={(v) => setTopic(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> All Users
                    </span>
                  </SelectItem>
                  <SelectItem value="farmers">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Farmers (topic)
                    </span>
                  </SelectItem>
                  <SelectItem value="dealers">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> Dealers (topic)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Optional User IDs (comma separated)</Label>
            <Input
              placeholder="(Optional) For future targeting support"
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Current backend endpoint sends to a topic. If you want user-id targeting, backend needs to support it.
              Parsed IDs: {parsedUserIds.length}
            </p>
          </div>

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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Image URL (optional)</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Slug / Screen (optional)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="some-slug-or-screen" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product ID (optional)</Label>
            <Input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="product-uuid" />
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
            Backend flow: <span className="font-mono">POST /fcm/send</span> sends FCM push + creates DB notifications for all active users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


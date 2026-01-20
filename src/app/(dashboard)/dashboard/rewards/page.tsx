"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gift,
  Download,
  Copy,
  CheckCircle,
  Clock,
  QrCode,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Reward } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function RewardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RewardsPage() {
  const { language } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      setIsLoading(true);
      try {
        const response = await api.getUserRewards();
        if (response.success && response.data) {
          setRewards(response.data);
        } else {
          setRewards([]);
        }
      } catch (error) {
        console.error("Failed to fetch rewards:", error);
        setRewards([]);
      }
      setIsLoading(false);
    };

    fetchRewards();
  }, []);

  const filteredRewards = rewards.filter((reward) => {
    if (activeTab === "all") return true;
    if (activeTab === "claimed") return reward.status === "CLAIMED";
    if (activeTab === "pending") return reward.status !== "CLAIMED";
    return true;
  });

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({
      title: language === "en" ? "Copied!" : "कॉपी हो गया!",
      description: code,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadCertificate = async (id: string) => {
    try {
      const response = await api.getRewardCertificate(id);
      
      if (response.success && response.data) {
        if (response.data.download_url) {
          window.open(response.data.download_url, "_blank");
        } else if (response.data.certificate_url) {
          window.open(response.data.certificate_url, "_blank");
        } else if (response.data.certificate_data) {
          // Backend provided certificate_data -> render a printable certificate on frontend
          const d = response.data.certificate_data;
          const w = window.open("", "_blank");
          if (!w) return;
          const html = `
            <html>
              <head>
                <title>Reward Certificate</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 24px; }
                  .card { border: 3px solid #16a34a; border-radius: 16px; padding: 24px; max-width: 760px; margin: 0 auto; }
                  .brand { font-size: 18px; font-weight: 700; color: #16a34a; }
                  .title { font-size: 28px; font-weight: 800; margin: 12px 0 4px; }
                  .sub { color: #555; margin-bottom: 18px; }
                  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                  .row { padding: 10px 12px; border: 1px solid #eee; border-radius: 10px; }
                  .label { font-size: 12px; color: #666; }
                  .value { font-size: 14px; font-weight: 600; margin-top: 4px; word-break: break-word; }
                  .footer { margin-top: 18px; font-size: 12px; color: #666; text-align: center; }
                  @media print { body { padding: 0; } .card { border-radius: 0; } }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="brand">AGRIO INDIA</div>
                  <div class="title">Reward Certificate</div>
                  <div class="sub">This certificate acknowledges the reward won via Agrio Scan & Win.</div>
                  <div class="grid">
                    <div class="row"><div class="label">Winner Name</div><div class="value">${d.winner_name}</div></div>
                    <div class="row"><div class="label">Phone</div><div class="value">${d.phone_number}</div></div>
                    <div class="row"><div class="label">Coupon Code</div><div class="value">${d.coupon_code}</div></div>
                    <div class="row"><div class="label">Prize</div><div class="value">${d.prize_name}</div></div>
                    <div class="row"><div class="label">Prize Value</div><div class="value">₹${d.prize_value}</div></div>
                    <div class="row"><div class="label">Prize Type</div><div class="value">${d.prize_type}</div></div>
                    <div class="row"><div class="label">Rank</div><div class="value">${d.rank}</div></div>
                    <div class="row"><div class="label">Won Date</div><div class="value">${new Date(d.won_date).toLocaleString()}</div></div>
                    <div class="row"><div class="label">Status</div><div class="value">${d.status}</div></div>
                  </div>
                  <div class="footer">Tip: Use browser Print → “Save as PDF” to download.</div>
                </div>
                <script>window.onload = () => { setTimeout(() => window.print(), 300); };</script>
              </body>
            </html>
          `;
          w.document.open();
          w.document.write(html);
          w.document.close();
        } else {
          toast({
            title: language === "en" ? "Coming Soon" : "जल्द आ रहा है",
            description: language === "en"
              ? "Certificate will be available after verification."
              : "सत्यापन के बाद प्रमाणपत्र उपलब्ध होगा।",
          });
        }
      } else {
        toast({
          title: language === "en" ? "Not Available" : "उपलब्ध नहीं",
          description: language === "en"
            ? "Certificate is not yet available."
            : "प्रमाणपत्र अभी उपलब्ध नहीं है।",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to get certificate" : "प्रमाणपत्र प्राप्त करने में विफल",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {language === "en" ? "My Rewards" : "मेरे पुरस्कार"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Track your earned rewards and download your reward letters."
            : "अपने अर्जित पुरस्कारों को ट्रैक करें और अपने पुरस्कार पत्र डाउनलोड करें।"}
        </p>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            {language === "en" ? "All" : "सभी"}
          </TabsTrigger>
          <TabsTrigger value="claimed">
            {language === "en" ? "Claimed" : "दावा किया"}
          </TabsTrigger>
          <TabsTrigger value="pending">
            {language === "en" ? "Pending" : "लंबित"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <RewardSkeleton key={index} />
              ))}
            </div>
          ) : filteredRewards.length > 0 ? (
            <div className="space-y-4">
              {filteredRewards.map((reward, index) => (
                <div
                  key={reward.id}
                  
                  
                  
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Reward Info */}
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Gift className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm text-muted-foreground">
                                {reward.type}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg">
                              ₹{reward.amount || 0}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {reward.product_name} • {formatDate(reward.won_at)}
                            </p>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3 ml-auto">
                          <Badge
                            variant={reward.status === "CLAIMED" ? "success" : "warning"}
                            className="shrink-0"
                          >
                            {reward.status === "CLAIMED" ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {language === "en" ? "Claimed" : "दावा किया"}
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                {language === "en" ? "Pending" : "लंबित"}
                              </>
                            )}
                          </Badge>
                          <Button
                            variant={reward.status === "CLAIMED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => downloadCertificate(reward.id)}
                            disabled={!reward.id}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {language === "en" ? "Download Letter" : "पत्र डाउनलोड करें"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "en" ? "No rewards yet" : "अभी तक कोई पुरस्कार नहीं"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === "en"
                    ? "Start scanning coupons to win exciting prizes!"
                    : "रोमांचक पुरस्कार जीतने के लिए कूपन स्कैन करना शुरू करें!"}
                </p>
                <Button asChild>
                  <Link href="/dashboard/scan">
                    <QrCode className="h-4 w-4 mr-2" />
                    {language === "en" ? "Scan Now" : "अभी स्कैन करें"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Links */}
      <div className="flex flex-wrap justify-center gap-4 pt-8 border-t">
        <Link href="/privacy-policy" className="text-sm text-primary hover:underline">
          {language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
        </Link>
        <Link href="/terms" className="text-sm text-primary hover:underline">
          {language === "en" ? "Terms of Service" : "सेवा की शर्तें"}
        </Link>
        <Link href="/contact" className="text-sm text-primary hover:underline">
          {language === "en" ? "Contact Us" : "संपर्क करें"}
        </Link>
      </div>
    </div>
  );
}

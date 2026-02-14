"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Gift,
  Download,
  CheckCircle,
  Clock,
  QrCode,
  Trophy,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Calendar,
  Hash,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Reward } from "@/lib/api";
import { formatDate } from "@/lib/utils";

function RewardSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-28" />
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
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  const totalEarnings = rewards.reduce((sum, r) => sum + (r.amount || 0), 0);
  const claimedCount = rewards.filter(r => r.status === "CLAIMED").length;
  const pendingCount = rewards.filter(r => r.status !== "CLAIMED").length;

  const downloadCertificate = async (id: string) => {
    try {
      const response = await api.getRewardCertificate(id);

      if (response.success && response.data) {
        if (response.data.download_url) {
          window.open(response.data.download_url, "_blank");
        } else if (response.data.certificate_url) {
          window.open(response.data.certificate_url, "_blank");
        } else if (response.data.certificate_data) {
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
                  <div class="footer">Tip: Use browser Print → "Save as PDF" to download.</div>
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
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {language === "en" ? "My Rewards" : "मेरे पुरस्कार"}
              </h1>
              <p className="text-white/70 text-sm">
                {language === "en" ? "Track and download your rewards" : "अपने पुरस्कारों को ट्रैक करें"}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">₹{totalEarnings}</p>
              <p className="text-xs text-white/70">{language === "en" ? "Total Earned" : "कुल कमाई"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold">{rewards.length}</p>
              <p className="text-xs text-white/70">{language === "en" ? "Rewards Won" : "जीते गए पुरस्कार"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {language === "en" ? "All" : "सभी"} ({rewards.length})
            </TabsTrigger>
            <TabsTrigger value="claimed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              {language === "en" ? "Claimed" : "प्राप्त"} ({rewards.length})
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
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedReward(reward);
                      setIsDetailOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Reward Info */}
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-green-50">
                                {reward.image_url ? (
                                  <img src={reward.image_url} alt={reward.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Gift className="h-7 w-7 text-green-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-xl text-gray-900 leading-tight">
                                    {reward.type === 'GIFT' ? (language === 'hi' && reward.name_hi ? reward.name_hi : (reward.name || 'Physical Gift')) : `₹${reward.amount || 0}`}
                                  </h3>
                                  <Badge variant="outline" className="text-[10px] h-5 py-0 font-black uppercase tracking-wider">
                                    {language === 'en' ? reward.type :
                                      reward.type === 'GIFT' ? 'उपहार' :
                                        reward.type === 'CASHBACK' ? 'कैशबैक' :
                                          reward.type === 'DISCOUNT' ? 'छूट' : reward.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {reward.product_name} • {formatDate(reward.won_at)}
                                </p>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="success"
                                className="shrink-0"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {language === "en" ? "Claimed" : "प्राप्त"}
                              </Badge>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => downloadCertificate(reward.id)}
                                disabled={false}
                                className="shrink-0"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {language === "en" ? "Download" : "डाउनलोड"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {language === "en" ? "No rewards yet" : "अभी तक कोई पुरस्कार नहीं"}
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    {language === "en"
                      ? "Start scanning product coupons to win exciting prizes!"
                      : "रोमांचक पुरस्कार जीतने के लिए उत्पाद कूपन स्कैन करें!"}
                  </p>
                  <Button asChild size="lg" className="shadow-lg">
                    <Link href="/dashboard/scan">
                      <QrCode className="h-5 w-5 mr-2" />
                      {language === "en" ? "Scan Now" : "अभी स्कैन करें"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Scan More CTA */}
      {rewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-md bg-gradient-to-r from-gray-50 to-gray-100">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold text-gray-900">
                    {language === "en" ? "Want more rewards?" : "और पुरस्कार चाहिए?"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === "en"
                      ? "Scan more product codes to win exciting prizes!"
                      : "और पुरस्कार जीतने के लिए उत्पाद कोड स्कैन करें!"}
                  </p>
                </div>
                <Button asChild className="shadow-lg shrink-0">
                  <Link href="/dashboard/scan">
                    {language === "en" ? "Scan Now" : "स्कैन करें"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reward Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden border-0 shadow-2xl">
          {selectedReward && (
            <div className="flex flex-col">
              {/* Image Section */}
              <div className="relative h-56 w-full">
                {selectedReward.image_url ? (
                  <img
                    src={selectedReward.image_url}
                    alt={selectedReward.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <Gift className="h-20 w-20 text-primary animate-pulse" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div className="text-white">
                    <h2 className="text-2xl font-black leading-tight">
                      {selectedReward.type === 'GIFT'
                        ? (language === 'hi' && selectedReward.name_hi ? selectedReward.name_hi : (selectedReward.name || 'Physical Gift'))
                        : `₹${selectedReward.amount || 0} Cashback`}
                    </h2>
                    <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-1">
                      {selectedReward.type} REWARD
                    </p>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {language === 'en' ? 'Verified' : 'सत्यापित'}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      {language === 'en' ? 'Product' : 'उत्पाद'}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{selectedReward.product_name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      {language === 'en' ? 'Won On' : 'जीता गया'}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedReward.won_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <Hash className="h-3.5 w-3.5 mr-1.5" />
                      {language === 'en' ? 'Coupon Code' : 'कूपन कोड'}
                    </div>
                    <p className="text-sm font-mono font-bold text-primary uppercase">{selectedReward.coupon_code || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-500 font-medium">
                      <Trophy className="h-3.5 w-3.5 mr-1.5" />
                      {language === 'en' ? 'ID' : 'आईडी'}
                    </div>
                    <p className="text-sm font-mono text-gray-600 text-[10px] truncate max-w-[120px]">{selectedReward.id}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Button
                    className="w-full h-12 text-md font-bold shadow-lg"
                    onClick={() => downloadCertificate(selectedReward.id)}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {language === 'en' ? 'Download Certificate' : 'प्रमाणपत्र डाउनलोड करें'}
                  </Button>

                  {selectedReward.acknowledgment_file_url && (
                    <Button variant="outline" className="w-full h-12" asChild>
                      <a href={selectedReward.acknowledgment_file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'View Document' : 'दस्तावेज़ देखें'}
                      </a>
                    </Button>
                  )}
                </div>

                <p className="text-[10px] text-center text-gray-400 italic">
                  {language === 'en'
                    ? 'Congratulations from Agrio India Crop Science! Keep scanning to win more.'
                    : 'एग्रियो इंडिया क्रॉप साइंस की ओर से बधाई! अधिक जीतने के लिए स्कैन करते रहें।'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

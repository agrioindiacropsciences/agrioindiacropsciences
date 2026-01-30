"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  QrCode,
  Gift,
  MapPin,
  Package,
  ScanLine,
  Calendar,
  ArrowRight,
  Trophy,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { UserStats, Reward, Crop } from "@/lib/api";

const quickActions = [
  {
    href: "/dashboard/rewards",
    icon: Gift,
    title: "My Rewards",
    titleHi: "मेरे पुरस्कार",
    description: "View earned rewards",
    descriptionHi: "अर्जित पुरस्कार देखें",
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50",
  },
  {
    href: "/dashboard/products",
    icon: Package,
    title: "Products",
    titleHi: "उत्पाद",
    description: "Recommended for you",
    descriptionHi: "आपके लिए अनुशंसित",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
  },
  {
    href: "/dashboard/distributors",
    icon: MapPin,
    title: "Distributors",
    titleHi: "वितरक",
    description: "Find nearby dealers",
    descriptionHi: "नजदीकी डीलर खोजें",
    gradient: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50",
  },
  {
    href: "/dashboard/support",
    icon: Zap,
    title: "Support",
    titleHi: "सहायता",
    description: "Get help anytime",
    descriptionHi: "कभी भी मदद लें",
    gradient: "from-teal-500 to-emerald-600",
    bgLight: "bg-teal-50",
  },
];

export default function DashboardPage() {
  const { language, user } = useStore();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [statsRes, rewardsRes, cropsRes] = await Promise.all([
          api.getUserStats(),
          api.getUserRewards(),
          api.getCropPreferences(),
        ]);

        if (statsRes.success && statsRes.data) {
          setUserStats(statsRes.data);
        }

        if (rewardsRes.success && rewardsRes.data) {
          setRewards(rewardsRes.data);
        }

        if (cropsRes.success && cropsRes.data) {
          setCrops(cropsRes.data.crops || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatLastScan = (date: string | null) => {
    if (!date) return language === "en" ? "Never" : "कभी नहीं";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return language === "en" ? "Today" : "आज";
    if (days === 1) return language === "en" ? "Yesterday" : "कल";
    return `${days} ${language === "en" ? "days ago" : "दिन पहले"}`;
  };

  const stats = [
    {
      title: language === "en" ? "Total Scans" : "कुल स्कैन",
      value: userStats?.total_scans?.toString() || "0",
      icon: ScanLine,
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
    },
    {
      title: language === "en" ? "Coupons Won" : "जीते कूपन",
      value: userStats?.coupons_won?.toString() || "0",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
    },
    {
      title: language === "en" ? "Claimed" : "प्राप्त",
      value: userStats?.rewards_claimed?.toString() || "0",
      icon: Gift,
      gradient: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
    },
    {
      title: language === "en" ? "Last Scan" : "अंतिम स्कैन",
      value: formatLastScan(userStats?.last_scan_date || null),
      icon: Calendar,
      gradient: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-sm text-white/80 font-medium">
                {language === "en" ? "Welcome back" : "वापसी पर स्वागत है"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {language === "en" ? `Namaste, ${user?.name?.split(" ")[0] || ""}!` : `नमस्ते, ${user?.name?.split(" ")[0] || ""}!`}
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-md">
              {language === "en" 
                ? "Scan product codes to win exciting rewards and track your progress."
                : "रोमांचक पुरस्कार जीतने के लिए उत्पाद कोड स्कैन करें।"}
            </p>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-xl h-14 px-8 rounded-xl font-semibold"
            >
              <Link href="/dashboard/scan" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <span className="block text-xs text-gray-500">{language === "en" ? "Start Scanning" : "स्कैन शुरू करें"}</span>
                  <span className="block">{language === "en" ? "Scan & Win" : "स्कैन और जीतें"}</span>
                </div>
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {language === "en" ? "Your Stats" : "आपके आंकड़े"}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div>
                          <Skeleton className="h-6 w-12 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl ${stat.bgLight} flex items-center justify-center`}>
                          <stat.icon className={`h-6 w-6 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: stat.gradient.includes('blue') ? '#3b82f6' : stat.gradient.includes('amber') ? '#f59e0b' : stat.gradient.includes('green') ? '#22c55e' : '#a855f7' }} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {language === "en" ? "Quick Actions" : "त्वरित कार्य"}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link href={action.href} className="block group">
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`h-1 bg-gradient-to-r ${action.gradient}`} />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-xl ${action.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className="h-5 w-5" style={{ color: action.gradient.includes('amber') ? '#f59e0b' : action.gradient.includes('blue') ? '#3b82f6' : action.gradient.includes('purple') ? '#a855f7' : '#14b8a6' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {language === "en" ? action.title : action.titleHi}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {language === "en" ? action.description : action.descriptionHi}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Crop Recommendations */}
      {crops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === "en" ? "Solutions for Your Crops" : "आपकी फसलों के लिए समाधान"}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {crops.slice(0, 3).map((crop, index) => (
              <Link
                key={crop.id}
                href={`/products?crop=${crop.id}`}
                className="group"
              >
                <div className="relative h-28 sm:h-36 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-200 shadow-md hover:shadow-xl transition-all">
                  {crop.image_url ? (
                    <Image
                      src={crop.image_url}
                      alt={crop.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 640px) 33vw, 200px"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-medium text-sm truncate">
                      {language === "en" ? crop.name : crop.name_hi}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {language === "en" ? "Recent Rewards" : "हाल के पुरस्कार"}
          </h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/dashboard/rewards">
              {language === "en" ? "View All" : "सभी देखें"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : rewards.length > 0 ? (
              <div className="divide-y">
                {rewards.slice(0, 3).map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {reward.type} - ₹{reward.amount}
                        </p>
                        <p className="text-xs text-gray-500">{reward.product_name}</p>
                      </div>
                    </div>
                    <Badge
                      variant={reward.status === "CLAIMED" ? "success" : "warning"}
                      className="shrink-0"
                    >
                      {reward.status === "CLAIMED"
                        ? language === "en" ? "Claimed" : "प्राप्त"
                        : language === "en" ? "Pending" : "लंबित"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {language === "en" ? "No rewards yet" : "अभी तक कोई पुरस्कार नहीं"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {language === "en" ? "Start scanning to win rewards!" : "पुरस्कार जीतने के लिए स्कैन करें!"}
                </p>
                <Button asChild size="sm">
                  <Link href="/dashboard/scan">
                    <QrCode className="h-4 w-4 mr-2" />
                    {language === "en" ? "Scan Now" : "अभी स्कैन करें"}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

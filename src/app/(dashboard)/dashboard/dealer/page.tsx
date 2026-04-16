"use client";

import React from "react";
import Link from "next/link";
import { 
  Building2, 
  BadgeCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  FileText, 
  Download, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import { Banner, AppConfig } from "@/lib/api/types";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function DealerHomePage() {
  const { language, distributorProfile } = useStore();
  const [banners, setBanners] = React.useState<Banner[]>([]);
  const [appConfig, setAppConfig] = React.useState<AppConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentBanner, setCurrentBanner] = React.useState(0);
  const [directPreviewUrl, setDirectPreviewUrl] = React.useState<string | null>(null);
  const [agreementPreviewUrl, setAgreementPreviewUrl] = React.useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [isAgreementLoading, setIsAgreementLoading] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bannersRes, configRes] = await Promise.all([
          api.getBanners('DEALER'),
          api.getAppConfig()
        ]);

        if (bannersRes.success && bannersRes.data) {
          const dealerBanners = bannersRes.data.filter(b => 
            b.section === 'DEALER' || b.target_audience === 'DEALER' || b.target_audience === 'ALL'
          );
          setBanners(dealerBanners);
        }

        if (configRes.success && configRes.data) {
          setAppConfig(configRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dealer home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    const fetchDirectPreview = async () => {
      if (appConfig?.price_list_pdf_url) {
        setIsPreviewLoading(true);
        try {
          const res = await api.getDealerPriceListSignedUrl(false);
          if (res.success && res.data) {
            setDirectPreviewUrl(res.data.url);
          }
        } catch (error) {
          console.error("Failed to fetch direct preview:", error);
        } finally {
          setIsPreviewLoading(false);
        }
      }
    };
    fetchDirectPreview();
  }, [appConfig?.price_list_pdf_url]);

  React.useEffect(() => {
    const fetchAgreementPreview = async () => {
      setIsAgreementLoading(true);
      try {
        const blob = await api.getDealerAgreementBlob(false);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setAgreementPreviewUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch agreement preview:", error);
      } finally {
        setIsAgreementLoading(false);
      }
    };
    if (distributorProfile?.verification_status === 'APPROVED') {
      fetchAgreementPreview();
    }
    
    return () => {
      if (agreementPreviewUrl) URL.revokeObjectURL(agreementPreviewUrl);
    };
  }, [distributorProfile?.verification_status]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  React.useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(nextBanner, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const businessName =
    distributorProfile?.business_name ||
    distributorProfile?.name ||
    (language === "en" ? "Business Account" : "बिज़नेस खाता");

  const handlePriceListAction = async (isDownload = false) => {
    try {
      const res = await api.getDealerPriceListSignedUrl(isDownload);
      if (res.success && res.data) {
        if (isDownload) {
          const link = document.createElement("a");
          link.href = res.data.url;
          link.download = "Agrio_India_Price_List.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          window.open(res.data.url, "_blank");
        }
      }
    } catch (error) {
      console.error("Failed to fetch price list:", error);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const res = await api.getDealerPriceListSignedUrl(false);
      if (res.success && res.data?.url) {
        const response = await fetch(res.data.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = blobUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
            } catch (e) {
              console.error("Print failed:", e);
            }
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
              URL.revokeObjectURL(blobUrl);
            }, 60000);
          }, 500);
        };
      }
    } catch (error) {
      console.error("Failed to print:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleAgreementDownload = async () => {
    try {
      const blob = await api.getDealerAgreementBlob(true);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Agrio_Agreement_${distributorProfile?.dealer_code || 'Draft'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download agreement:", error);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl theme-transition">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {language === "en" ? "Approved Account" : "स्वीकृत खाता"}
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{businessName}</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75 leading-relaxed">
                {language === "en"
                  ? "Your business profile is active on the website. Keep your business, compliance, and contact details updated from your profile."
                  : "आपकी बिज़नेस प्रोफ़ाइल वेबसाइट पर सक्रिय है। अपनी व्यावसायिक, अनुपालन और संपर्क जानकारी प्रोफ़ाइल से अपडेट रखें।"}
              </p>
            </div>
          </div>
          {distributorProfile?.dealer_code ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-md shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/60 font-bold">
                {language === "en" ? "Account Code" : "अकाउंट कोड"}
              </div>
              <div className="mt-1 text-2xl font-bold font-mono">{distributorProfile.dealer_code}</div>
            </div>
          ) : null}
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm transition-all hover:shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Building2 className="h-5 w-5 text-primary" />
              {language === "en" ? "Business Overview" : "व्यवसाय विवरण"}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {language === "en"
                ? "Primary business profile visible to your team and admin."
                : "आपकी टीम और एडमिन को दिखाई देने वाली मुख्य बिज़नेस प्रोफ़ाइल।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
                {language === "en" ? "Business Name" : "व्यवसाय का नाम"}
              </div>
              <div className="mt-1 text-lg font-bold text-slate-900">{businessName}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50">
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
                  {language === "en" ? "Contact" : "संपर्क"}
                </div>
                <div className="mt-1 flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{distributorProfile?.phone || "-"}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/50">
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
                  {language === "en" ? "Email" : "ईमेल"}
                </div>
                <div className="mt-1 flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="truncate">{distributorProfile?.email || "-"}</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100/50">
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-bold">
                {language === "en" ? "Address" : "पता"}
              </div>
              <div className="mt-2 flex items-start gap-2 font-medium">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="leading-relaxed">
                  {[
                    distributorProfile?.address,
                    distributorProfile?.city,
                    distributorProfile?.state,
                    distributorProfile?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {language === "en" ? "Verification Status" : "सत्यापन स्थिति"}
              </CardTitle>
              <CardDescription className="text-slate-500">
                {language === "en"
                  ? "Your account is approved and publicly visible."
                  : "आपका खाता स्वीकृत है और सार्वजनिक रूप से दिखाई दे रहा है।"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-900 shadow-sm">
                <div className="flex items-center gap-2 font-bold">
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                  {language === "en" ? "Registration Verified" : "पंजीकरण सत्यापित"}
                </div>
                <p className="mt-2 text-sm text-emerald-800/80 leading-relaxed font-medium">
                  {language === "en"
                    ? "Your profile is now verified. You will appear in distributor recommendations for your assigned region."
                    : "आपकी प्रोफ़ाइल अब सत्यापित है। आप अपने निर्दिष्ट क्षेत्र के वितरक अनुशंसाओं में दिखाई देंगे।"}
                </p>
              </div>

              <Button asChild className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/10">
                <Link href="/dashboard/profile/distributor">
                  {language === "en" ? "Edit Business Profile" : "बिज़नेस प्रोफ़ाइल संपादित करें"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {loading ? (
        <Skeleton className="h-[240px] w-full rounded-3xl" />
      ) : banners.length > 0 ? (
        <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm group">
          <div className="relative h-[240px] sm:h-[320px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <div className="relative h-full w-full">
                  <img
                    src={banners[currentBanner].image_url}
                    alt={banners[currentBanner].title || "Banner"}
                    className="h-full w-full object-cover"
                  />
                  {banners[currentBanner].title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                      <div className="absolute bottom-6 left-6 right-6">
                        <h2 className="text-xl font-bold text-white sm:text-2xl">
                          {language === "hi" && banners[currentBanner].title_hi 
                            ? banners[currentBanner].title_hi 
                            : banners[currentBanner].title}
                        </h2>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          {banners.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.preventDefault(); prevBanner(); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.preventDefault(); nextBanner(); }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                {banners.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentBanner ? "w-6 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border border-slate-200 shadow-2xl bg-white rounded-3xl group flex flex-col">
          <div className="bg-white border-b border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {language === "en" ? "Price List" : "मूल्य सूची"}
                </h2>
                {appConfig?.price_list_updated_at && (
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    Updated {new Date(appConfig.price_list_updated_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => handlePriceListAction(false)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 rounded-lg font-bold text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0"
                onClick={() => handlePriceListAction(true)}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                {language === "en" ? "PDF" : "पी़डीएफ"}
              </Button>
            </div>
          </div>

          <CardContent className="p-0 flex-1">
            <div className="relative w-full h-[700px] bg-slate-50">
              {directPreviewUrl ? (
                <iframe 
                  src={`${directPreviewUrl}#toolbar=0&navpanes=0&view=FitH`} 
                  className="w-full h-full border-0 animate-in fade-in duration-700" 
                  title="Price List Direct Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <Loader2 className="h-10 w-10 animate-spin opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">Preparing Document</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-slate-200 shadow-xl bg-white rounded-3xl flex flex-col">
          <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {language === "en" ? "Dealer Agreement" : "डीलर समझौता"}
                </h2>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                  {new Date().toLocaleDateString()} • Authorized Draft
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={handleAgreementDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 font-bold text-[10px]">
                {language === "en" ? "ACTIVE" : "सक्रिय"}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-0 flex-1 bg-slate-50 relative">
            <div className="relative w-full h-[700px]">
              {agreementPreviewUrl ? (
                <iframe 
                  src={`${agreementPreviewUrl}#toolbar=0&navpanes=0&view=FitH`} 
                  className="w-full h-full border-0 animate-in fade-in duration-700" 
                  title="Dealer Agreement Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <Loader2 className="h-10 w-10 animate-spin opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">Generating Your Agreement</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

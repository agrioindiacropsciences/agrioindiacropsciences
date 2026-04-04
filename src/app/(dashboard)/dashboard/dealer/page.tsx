"use client";

import React from "react";
import Link from "next/link";
import { Building2, BadgeCheck, MapPin, Phone, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";

export default function DealerHomePage() {
  const { language, distributorProfile } = useStore();

  const businessName =
    distributorProfile?.business_name ||
    distributorProfile?.name ||
    (language === "en" ? "Business Account" : "बिज़नेस खाता");

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              {language === "en" ? "Approved Account" : "स्वीकृत खाता"}
            </Badge>
            <div>
              <h1 className="text-3xl font-bold">{businessName}</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75">
                {language === "en"
                  ? "Your business profile is active on the website. Keep your business, compliance, and contact details updated from your profile."
                  : "आपकी बिज़नेस प्रोफ़ाइल वेबसाइट पर सक्रिय है। अपनी व्यावसायिक, अनुपालन और संपर्क जानकारी प्रोफ़ाइल से अपडेट रखें।"}
              </p>
            </div>
          </div>
          {distributorProfile?.dealer_code ? (
            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.24em] text-white/60">
                {language === "en" ? "Account Code" : "अकाउंट कोड"}
              </div>
              <div className="mt-2 text-2xl font-semibold">{distributorProfile.dealer_code}</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {language === "en" ? "Business Overview" : "व्यवसाय विवरण"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Primary business profile visible to your team and admin."
                : "आपकी टीम और एडमिन को दिखाई देने वाली मुख्य बिज़नेस प्रोफ़ाइल।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {language === "en" ? "Business Name" : "व्यवसाय का नाम"}
              </div>
              <div className="mt-1 text-lg font-semibold">{businessName}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {language === "en" ? "Contact" : "संपर्क"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{distributorProfile?.phone || "-"}</span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {language === "en" ? "Email" : "ईमेल"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{distributorProfile?.email || "-"}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                {language === "en" ? "Address" : "पता"}
              </div>
              <div className="mt-1 flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
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

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {language === "en" ? "Verification Status" : "सत्यापन स्थिति"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Your account is approved and publicly visible."
                : "आपका खाता स्वीकृत है और सार्वजनिक रूप से दिखाई दे रहा है।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
              <div className="flex items-center gap-2 font-semibold">
                <BadgeCheck className="h-5 w-5" />
                {language === "en" ? "Approval completed" : "स्वीकृति पूरी हुई"}
              </div>
              <p className="mt-2 text-sm text-emerald-800/90">
                {language === "en"
                  ? "Your profile can now appear in nearby distributor searches and business-specific website experiences."
                  : "अब आपकी प्रोफ़ाइल नजदीकी वितरक खोज और बिज़नेस वेबसाइट अनुभव में दिखाई दे सकती है।"}
              </p>
            </div>

            <Button asChild className="w-full h-12 rounded-xl">
              <Link href="/dashboard/profile/distributor">
                {language === "en" ? "Manage Business Profile" : "बिज़नेस प्रोफ़ाइल प्रबंधित करें"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

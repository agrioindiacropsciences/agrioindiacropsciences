"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Search, ShieldCheck, LifeBuoy, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";

export default function DealerReviewPage() {
  const { language, distributorProfile, setDistributorProfile } = useStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const steps = useMemo(
    () => [
      {
        icon: ClipboardCheck,
        title: language === "en" ? "Documents Submitted" : "दस्तावेज जमा",
        description:
          language === "en"
            ? "Your documents and details were received successfully."
            : "आपके दस्तावेज और विवरण सफलतापूर्वक प्राप्त हो गए हैं।",
      },
      {
        icon: Search,
        title: language === "en" ? "Compliance Review" : "अनुपालन समीक्षा",
        description:
          language === "en"
            ? "Our team is validating your business, GST, PAN, and Aadhaar records."
            : "हमारी टीम आपके व्यवसाय, जीएसटी, पैन और आधार रिकॉर्ड की जांच कर रही है।",
      },
      {
        icon: ShieldCheck,
        title: language === "en" ? "Final Approval" : "अंतिम स्वीकृति",
        description:
          language === "en"
            ? "Once approved, your website account will open automatically."
            : "स्वीकृति के बाद आपका वेबसाइट खाता स्वतः सक्रिय हो जाएगा।",
      },
    ],
    [language],
  );

  useEffect(() => {
    const refreshProfile = async () => {
      const response = await api.distributorsApi.getMyProfile();
      if (!response.success) return;

      setDistributorProfile(response.data || null);

      if (!response.data || response.data.verification_status === "REJECTED") {
        router.replace("/dashboard/profile/distributor");
        return;
      }

      if (response.data.verification_status === "APPROVED") {
        router.replace("/dashboard/dealer");
      }
    };

    refreshProfile();
    const interval = window.setInterval(refreshProfile, 30000);
    window.addEventListener("focus", refreshProfile);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshProfile);
    };
  }, [router, setDistributorProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const response = await api.distributorsApi.getMyProfile();
    if (response.success) {
      setDistributorProfile(response.data || null);
      if (response.data?.verification_status === "APPROVED") {
        router.replace("/dashboard/dealer");
      }
    }
    setIsRefreshing(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            {language === "en" ? "Verification Under Review" : "सत्यापन समीक्षा में है"}
          </div>
          <h1 className="mt-4 text-4xl font-bold">
            {language === "en" ? "Your request is in review" : "आपका अनुरोध समीक्षा में है"}
          </h1>
          <p className="mt-4 text-base text-white/75">
            {language === "en"
              ? "Our team is reviewing your submitted business profile and compliance documents. This usually takes 24 to 48 business hours."
              : "हमारी टीम आपकी बिज़नेस प्रोफ़ाइल और अनुपालन दस्तावेजों की समीक्षा कर रही है। इसमें आमतौर पर 24 से 48 कार्य घंटे लगते हैं।"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {language === "en" ? `Step ${index + 1}` : `चरण ${index + 1}`}
              </div>
              <h2 className="mt-2 text-xl font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {language === "en" ? "Need help with your application?" : "अपने आवेदन में मदद चाहिए?"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "en"
                ? "Reach out to the Agrio support team if you need document or profile help."
                : "यदि आपको दस्तावेज़ या प्रोफ़ाइल में मदद चाहिए तो एग्रियो सपोर्ट टीम से संपर्क करें।"}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@agrioindiacropsciences.com
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +91 9520609999
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild className="rounded-xl">
              <a href="mailto:support@agrioindiacropsciences.com">
                <LifeBuoy className="mr-2 h-4 w-4" />
                {language === "en" ? "Email Support" : "ईमेल सहायता"}
              </a>
            </Button>
            <Button onClick={handleRefresh} disabled={isRefreshing} className="rounded-xl">
              {isRefreshing
                ? (language === "en" ? "Checking..." : "जांच हो रही है...")
                : (language === "en" ? "Check Status" : "स्थिति जांचें")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {distributorProfile?.dealer_code ? (
        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-5 py-4 text-sm text-primary">
          {language === "en" ? "Assigned account code:" : "आवंटित अकाउंट कोड:"}{" "}
          <span className="font-semibold">{distributorProfile.dealer_code}</span>
        </div>
      ) : null}
    </div>
  );
}

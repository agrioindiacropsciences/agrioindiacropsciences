"use client";

import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TractorLoader } from "@/components/ui/tractor-loader";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { CmsPage } from "@/lib/api";

export default function PrivacyPolicyPage() {
  const { language } = useStore();
  const [pageData, setPageData] = useState<CmsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const response = await api.getCmsPage("privacy-policy");
        if (response.success && response.data) {
          setPageData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch privacy policy:", error);
      }
      setIsLoading(false);
    };

    fetchPage();
  }, []);

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-dark to-primary py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div


            className="text-center text-white"
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white/10 mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {language === "en"
                ? "Your privacy is important to us. Learn how we collect, use, and protect your information."
                : "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। जानें कि हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।"}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Card>
            <CardContent className="p-8">
              {isLoading ? (
                <div className="py-16 flex justify-center">
                  <TractorLoader size="md" />
                </div>
              ) : pageData ? (
                <div className="prose prose-green max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        language === "en"
                          ? pageData.content || ""
                          : pageData.content_hi || pageData.content || "",
                    }}
                  />
                  {pageData.updated_at && (
                    <p className="text-sm text-muted-foreground mt-8 pt-4 border-t">
                      {language === "en" ? "Last updated: " : "अंतिम अपडेट: "}
                      {new Date(pageData.updated_at).toLocaleDateString(
                        language === "en" ? "en-IN" : "hi-IN"
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <div className="prose prose-green max-w-none">
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "Privacy policy content is currently unavailable. Please try again later."
                      : "गोपनीयता नीति की सामग्री अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

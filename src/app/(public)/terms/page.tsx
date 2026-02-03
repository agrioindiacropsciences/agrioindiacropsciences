"use client";

import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TractorLoader } from "@/components/ui/tractor-loader";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { CmsPage } from "@/lib/api";

export default function TermsPage() {
  const { language } = useStore();
  const [pageData, setPageData] = useState<CmsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const response = await api.getCmsPage("terms");
        if (response.success && response.data) {
          setPageData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch terms:", error);
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
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === "en" ? "Terms of Service" : "सेवा की शर्तें"}
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {language === "en"
                ? "Please read these terms carefully before using our services."
                : "हमारी सेवाओं का उपयोग करने से पहले कृपया इन शर्तों को ध्यान से पढ़ें।"}
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
                      __html: language === "en" 
                        ? pageData.content || ""
                        : pageData.content_hi || pageData.content || "",
                    }}
                  />
                  {pageData.updated_at && (
                    <p className="text-sm text-muted-foreground mt-8 pt-4 border-t">
                      {language === "en" ? "Last updated: " : "अंतिम अपडेट: "}
                      {new Date(pageData.updated_at).toLocaleDateString(language === "en" ? "en-IN" : "hi-IN")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="prose prose-green max-w-none">
                  <h2>{language === "en" ? "Terms of Service" : "सेवा की शर्तें"}</h2>
                  
                  <h3>{language === "en" ? "1. Acceptance of Terms" : "1. शर्तों की स्वीकृति"}</h3>
                  <p>
                    {language === "en"
                      ? "By accessing and using Agrio India services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services."
                      : "एग्रियो इंडिया सेवाओं तक पहुंच और उपयोग करके, आप इन सेवा की शर्तों से बंधे होने के लिए सहमत हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।"}
                  </p>

                  <h3>{language === "en" ? "2. User Account" : "2. उपयोगकर्ता खाता"}</h3>
                  <p>
                    {language === "en"
                      ? "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account."
                      : "आप अपने खाते की साख की गोपनीयता बनाए रखने और अपने खाते के तहत होने वाली सभी गतिविधियों के लिए जिम्मेदार हैं। अपना खाता बनाते समय आपको सटीक और पूर्ण जानकारी प्रदान करनी होगी।"}
                  </p>

                  <h3>{language === "en" ? "3. Rewards Program" : "3. पुरस्कार कार्यक्रम"}</h3>
                  <p>
                    {language === "en"
                      ? "Our rewards program is subject to specific terms and conditions. Rewards are non-transferable and must be redeemed within the specified validity period. We reserve the right to modify or terminate the rewards program at any time."
                      : "हमारा पुरस्कार कार्यक्रम विशिष्ट नियमों और शर्तों के अधीन है। पुरस्कार गैर-हस्तांतरणीय हैं और निर्दिष्ट वैधता अवधि के भीतर भुनाए जाने चाहिए। हम किसी भी समय पुरस्कार कार्यक्रम को संशोधित या समाप्त करने का अधिकार सुरक्षित रखते हैं।"}
                  </p>

                  <h3>{language === "en" ? "4. Product Information" : "4. उत्पाद जानकारी"}</h3>
                  <p>
                    {language === "en"
                      ? "We strive to provide accurate product information. However, we do not warrant that product descriptions or other content is accurate, complete, or current. Always follow the instructions on product labels."
                      : "हम सटीक उत्पाद जानकारी प्रदान करने का प्रयास करते हैं। हालांकि, हम इस बात की गारंटी नहीं देते कि उत्पाद विवरण या अन्य सामग्री सटीक, पूर्ण या वर्तमान है। हमेशा उत्पाद लेबल पर दिए गए निर्देशों का पालन करें।"}
                  </p>

                  <h3>{language === "en" ? "5. Limitation of Liability" : "5. दायित्व की सीमा"}</h3>
                  <p>
                    {language === "en"
                      ? "Agrio India shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or products."
                      : "एग्रियो इंडिया हमारी सेवाओं या उत्पादों के आपके उपयोग से उत्पन्न किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी या दंडात्मक नुकसान के लिए उत्तरदायी नहीं होगा।"}
                  </p>

                  <h3>{language === "en" ? "6. Changes to Terms" : "6. शर्तों में परिवर्तन"}</h3>
                  <p>
                    {language === "en"
                      ? "We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms."
                      : "हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। परिवर्तनों के बाद हमारी सेवाओं का निरंतर उपयोग नई शर्तों की स्वीकृति माना जाएगा।"}
                  </p>

                  <h3>{language === "en" ? "7. Contact" : "7. संपर्क"}</h3>
                  <p>
                    {language === "en"
                      ? "For questions about these Terms of Service, please contact us at legal@agrioindia.com."
                      : "इन सेवा की शर्तों के बारे में प्रश्नों के लिए, कृपया legal@agrioindia.com पर हमसे संपर्क करें।"}
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

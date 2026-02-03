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
                  <h2>{language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}</h2>
                  
                  <h3>{language === "en" ? "1. Information We Collect" : "1. हम कौन सी जानकारी एकत्र करते हैं"}</h3>
                  <p>
                    {language === "en"
                      ? "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, phone number, email address, and location information."
                      : "हम वह जानकारी एकत्र करते हैं जो आप सीधे हमें प्रदान करते हैं, जैसे जब आप खाता बनाते हैं, खरीदारी करते हैं, या सहायता के लिए हमसे संपर्क करते हैं। इसमें आपका नाम, फोन नंबर, ईमेल पता और स्थान की जानकारी शामिल है।"}
                  </p>

                  <h3>{language === "en" ? "2. How We Use Your Information" : "2. हम आपकी जानकारी का उपयोग कैसे करते हैं"}</h3>
                  <p>
                    {language === "en"
                      ? "We use the information we collect to provide, maintain, and improve our services, process transactions, send promotional communications, and respond to your inquiries."
                      : "हम एकत्र की गई जानकारी का उपयोग अपनी सेवाएं प्रदान करने, बनाए रखने और सुधारने, लेनदेन संसाधित करने, प्रचार संचार भेजने और आपकी पूछताछ का जवाब देने के लिए करते हैं।"}
                  </p>

                  <h3>{language === "en" ? "3. Information Sharing" : "3. जानकारी साझा करना"}</h3>
                  <p>
                    {language === "en"
                      ? "We do not sell your personal information. We may share your information with service providers who assist us in our operations, or as required by law."
                      : "हम आपकी व्यक्तिगत जानकारी नहीं बेचते हैं। हम आपकी जानकारी सेवा प्रदाताओं के साथ साझा कर सकते हैं जो हमारे संचालन में सहायता करते हैं, या कानून द्वारा आवश्यक होने पर।"}
                  </p>

                  <h3>{language === "en" ? "4. Data Security" : "4. डेटा सुरक्षा"}</h3>
                  <p>
                    {language === "en"
                      ? "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
                      : "हम आपकी व्यक्तिगत जानकारी को अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण या विनाश से बचाने के लिए उचित सुरक्षा उपाय लागू करते हैं।"}
                  </p>

                  <h3>{language === "en" ? "5. Contact Us" : "5. हमसे संपर्क करें"}</h3>
                  <p>
                    {language === "en"
                      ? "If you have any questions about this Privacy Policy, please contact us at privacy@agrioindia.com or call our support line."
                      : "यदि आपके पास इस गोपनीयता नीति के बारे में कोई प्रश्न है, तो कृपया privacy@agrioindia.com पर या हमारी सहायता लाइन पर कॉल करें।"}
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

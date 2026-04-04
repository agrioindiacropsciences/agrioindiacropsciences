"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, ChevronRight, Clock } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DistributorVerificationBanner() {
  const pathname = usePathname();
  const { language, distributorProfile, isAuthenticated, user } = useStore();

  if (!isAuthenticated) return null;
  
  // Normal users (Farmers/Customers) shouldn't see distributor verification
  if (user?.role === "FARMER") return null;

  if (
    user?.role === "DEALER" &&
    (pathname.startsWith("/dashboard/dealer") || pathname === "/dashboard/profile/distributor")
  ) {
    return null;
  }

  // If already verified, show nothing
  if (distributorProfile?.verification_status === "APPROVED") return null;

  // If pending, show status
  if (distributorProfile?.verification_status === "PENDING") {
    return (
      <div className="mb-6">
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-semibold">
            {language === "en" ? "Verification Pending" : "सत्यापन लंबित है"}
          </AlertTitle>
          <AlertDescription className="text-sm opacity-90">
            {language === "en"
              ? "Your distributor verification is currently being reviewed. We'll notify you once it's approved."
              : "आपका वितरक सत्यापन वर्तमान में समीक्षाधीन है। स्वीकृत होने पर हम आपको सूचित करेंगे।"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If rejected, show why and allow resubmission
  if (distributorProfile?.verification_status === "REJECTED") {
    return (
      <div className="mb-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            {language === "en" ? "Verification Rejected" : "सत्यापन अस्वीकार कर दिया गया"}
          </AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span className="text-sm">
              {language === "en"
                ? "Your application was not approved. Please review your details and resubmit."
                : "आपका आवेदन स्वीकृत नहीं हुआ। कृपया अपने विवरण की समीक्षा करें और पुनः सबमिट करें।"}
            </span>
            <Button asChild size="sm" variant="outline" className="bg-white hover:bg-white/90">
              <Link href="/dashboard/profile/distributor">
                {language === "en" ? "Resubmit Application" : "पुनः सबमिट करें"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If no profile exists at all (Not submitted)
  return (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {language === "en" ? "Complete Distributor Verification" : "वितरक सत्यापन पूरा करें"}
              </h3>
              <p className="text-sm text-white/80 max-w-md mt-1">
                {language === "en"
                  ? "To access distributor features, rewards management, and more, please complete your verification."
                  : "वितरक सुविधाओं, पुरस्कार प्रबंधन और बहुत कुछ प्राप्त करने के लिए कृपया अपना सत्यापन पूरा करें।"}
              </p>
            </div>
          </div>
          <Button asChild className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md whitespace-nowrap">
            <Link href="/dashboard/profile/distributor">
              {language === "en" ? "Get Verified Now" : "अभी सत्यापित करें"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Decorative background circle */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl font-semibold "></div>
      </div>
    </div>
  );
}

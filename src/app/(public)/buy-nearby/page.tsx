"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  MapPinOff,
  Loader2,
  Store,
  User,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Distributor } from "@/lib/api";
import {
  AnimatedSection,
  AnimatedContainer,
  AnimatedItem,
  FloatingElement,
} from "@/components/ui/animated-section";

function DistributorSkeleton() {
  return (
    <Card className="h-full border-0 shadow-lg">
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function BuyNearbyPage() {
  const { language, user } = useStore();
  const { toast } = useToast();
  const [pincode, setPincode] = useState("");
  const [searchedPincode, setSearchedPincode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Search function that can be called with pincode parameter
  const handleSearchWithPincode = async (pincodeToSearch: string) => {
    if (!pincodeToSearch || pincodeToSearch.length !== 6) {
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await api.getDistributors({ pincode: pincodeToSearch });
      
      if (response.success && response.data) {
        setDistributors(response.data);
        setSearchedPincode(pincodeToSearch);
      } else {
        setDistributors([]);
        toast({
          title: language === "en" ? "Error" : "त्रुटि",
          description: response.error?.message || (language === "en"
            ? "Failed to search distributors"
            : "वितरकों की खोज विफल रही"),
          variant: "destructive",
        });
      }
    } catch (error) {
      setDistributors([]);
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en"
          ? "Something went wrong. Please try again."
          : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!pincode || pincode.length !== 6) {
      toast({
        title: language === "en" ? "Invalid Pincode" : "अमान्य पिनकोड",
        description: language === "en" 
          ? "Please enter a valid 6-digit pincode"
          : "कृपया एक वैध 6 अंकों का पिनकोड दर्ज करें",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await api.getDistributors({ pincode });
      
      if (response.success && response.data) {
        setDistributors(response.data);
        setSearchedPincode(pincode);
      } else {
        setDistributors([]);
        toast({
          title: language === "en" ? "Error" : "त्रुटि",
          description: response.error?.message || (language === "en"
            ? "Failed to search distributors"
            : "वितरकों की खोज विफल रही"),
          variant: "destructive",
        });
      }
    } catch (error) {
      setDistributors([]);
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en"
          ? "Something went wrong. Please try again."
          : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    }
    
    setIsSearching(false);
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await api.getDistributors({
              pincode: "000000",
              lat: latitude,
              lng: longitude,
            });
            
            if (response.success && response.data) {
              setDistributors(response.data);
              setSearchedPincode(language === "en" ? "Your Location" : "आपका स्थान");
              setHasSearched(true);
            }
          } catch (error) {
            toast({
              title: language === "en" ? "Error" : "त्रुटि",
              description: language === "en"
                ? "Failed to search by location"
                : "स्थान द्वारा खोज विफल रही",
              variant: "destructive",
            });
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          toast({
            title: language === "en" ? "Location Error" : "स्थान त्रुटि",
            description: language === "en"
              ? "Unable to get your location. Please enter pincode manually."
              : "आपका स्थान प्राप्त करने में असमर्थ। कृपया पिनकोड मैन्युअल रूप से दर्ज करें।",
            variant: "destructive",
          });
          setIsLocating(false);
        }
      );
    } else {
      toast({
        title: language === "en" ? "Not Supported" : "समर्थित नहीं",
        description: language === "en"
          ? "Geolocation is not supported by your browser"
          : "आपके ब्राउज़र द्वारा जियोलोकेशन समर्थित नहीं है",
        variant: "destructive",
      });
      setIsLocating(false);
    }
  };

  // Fetch user pincode and auto-search on mount if user is logged in
  useEffect(() => {
    const fetchUserPincodeAndSearch = async () => {
      if (user?.pincode && user.pincode.length === 6) {
        setPincode(user.pincode);
        handleSearchWithPincode(user.pincode);
      } else if (user?.id) {
        try {
          const response = await api.getProfile();
          if (response.success && response.data?.pin_code) {
            const userPincode = response.data.pin_code;
            if (userPincode && userPincode.length === 6) {
              setPincode(userPincode);
              handleSearchWithPincode(userPincode);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      }
    };

    fetchUserPincodeAndSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.pincode]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Header */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/road-middle-sugar-cane-field-sunny-day-with-mountain-back.jpg"
            alt="Road through sugar cane fields with mountains"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        </div>

        {/* Floating decorations */}
        <FloatingElement className="absolute top-20 right-20 opacity-20" duration={5}>
          <Store className="h-24 w-24 text-white" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-20 left-20 opacity-20" duration={6} delay={2}>
          <MapPin className="h-20 w-20 text-white" />
        </FloatingElement>

        <div className="container mx-auto px-4 lg:px-8 relative py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-2">
              <MapPin className="h-4 w-4 mr-2" />
              {language === "en" ? "500+ Distributors Nationwide" : "देशभर में 500+ वितरक"}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {language === "en"
                ? "Find Our Distributor Near You"
                : "अपने पास वितरक खोजें"}
            </h1>
            <p className="text-xl text-white/90 mb-10">
              {language === "en"
                ? "Enter your pincode or use your current location to find Agrio products available in your area."
                : "अपने क्षेत्र में उपलब्ध एग्रियो उत्पादों को खोजने के लिए अपना पिनकोड दर्ज करें या अपने वर्तमान स्थान का उपयोग करें।"}
            </p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full sm:flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                  <Input
                    placeholder={language === "en" ? "Enter Your 6-Digit Pincode" : "अपना 6 अंकों का पिनकोड दर्ज करें"}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-14 text-lg rounded-xl border-2 focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching || pincode.length !== 6}
                      className="w-full h-14 px-6 rounded-xl shadow-lg shadow-primary/20"
                    >
                      {isSearching ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          {language === "en" ? "Search" : "खोजें"}
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                    <Button
                      variant="outline"
                      onClick={handleUseLocation}
                      disabled={isLocating}
                      className="w-full h-14 px-6 rounded-xl border-2"
                    >
                      {isLocating ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Navigation className="h-5 w-5 mr-2" />
                          <span className="hidden sm:inline">{language === "en" ? "Use Location" : "स्थान"}</span>
                          <span className="sm:hidden">{language === "en" ? "GPS" : "GPS"}</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          {searchedPincode && (
            <AnimatedSection className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {language === "en" ? "Showing results for" : "परिणाम दिखा रहे हैं"}
                    </p>
                    <p className="text-xl font-bold text-primary">{searchedPincode}</p>
                  </div>
                </div>
                <Badge variant="outline" className="px-4 py-2">
                  {distributors.length} {language === "en" ? "Distributors found" : "वितरक मिले"}
                </Badge>
              </div>
            </AnimatedSection>
          )}

          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <DistributorSkeleton key={index} />
                ))}
              </motion.div>
            ) : distributors.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnimatedContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                  {distributors.map((distributor, index) => (
                    <AnimatedItem key={distributor.id}>
                      <motion.div
                        whileHover={{ y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                          <div className="h-2 bg-gradient-to-r from-primary to-emerald-500" />
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg">
                                  <Store className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg">
                                    {distributor.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {distributor.address}, {distributor.city}
                                  </p>
                                </div>
                              </div>
                              {distributor.is_active && (
                                <Badge className="bg-green-100 text-green-700 border-0">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {language === "en" ? "Active" : "सक्रिय"}
                                </Badge>
                              )}
                            </div>

                            {/* Distance */}
                            {distributor.distance_km && (
                              <div className="flex items-center gap-2 text-sm text-primary mb-4 bg-primary/5 rounded-lg px-3 py-2">
                                <Navigation className="h-4 w-4" />
                                <span className="font-medium">
                                  {distributor.distance_km.toFixed(1)} {language === "en" ? "km away" : "किमी दूर"}
                                </span>
                              </div>
                            )}

                            {/* Phone */}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <Phone className="h-4 w-4 text-primary" />
                              <a href={`tel:${distributor.phone}`} className="hover:text-primary font-medium">
                                {distributor.phone}
                              </a>
                            </div>

                            {/* Owner */}
                            {distributor.owner_name && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                <User className="h-4 w-4 text-primary" />
                                <span>{language === "en" ? "Owner:" : "मालिक:"} {distributor.owner_name}</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4">
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                <Button asChild className="w-full h-12 rounded-xl shadow-lg shadow-primary/20">
                                  <a href={`tel:${distributor.phone}`}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    {language === "en" ? "Call Now" : "कॉल करें"}
                                  </a>
                                </Button>
                              </motion.div>
                              {distributor.latitude && distributor.longitude && (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                                  <Button variant="outline" asChild className="w-full h-12 rounded-xl border-2">
                                    <a
                                      href={`https://www.google.com/maps/dir/?api=1&destination=${distributor.latitude},${distributor.longitude}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Navigation className="h-4 w-4 mr-2" />
                                      {language === "en" ? "Navigate" : "नेविगेट"}
                                    </a>
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </AnimatedItem>
                  ))}
                </AnimatedContainer>
              </motion.div>
            ) : hasSearched ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-16 text-center border-0 shadow-xl max-w-2xl mx-auto">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MapPinOff className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">
                    {language === "en" ? "No Distributors Found" : "कोई वितरक नहीं मिला"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {language === "en"
                      ? "We couldn't find any distributors in your area. Please try another pincode or contact our support for assistance."
                      : "हमें आपके क्षेत्र में कोई वितरक नहीं मिला। कृपया दूसरा पिनकोड आज़माएं या सहायता के लिए हमारे सपोर्ट से संपर्क करें।"}
                  </p>
                  <Button variant="outline" onClick={() => setPincode("")} size="lg" className="rounded-xl">
                    {language === "en" ? "Try Another Pincode" : "दूसरा पिनकोड आज़माएं"}
                  </Button>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 mb-6"
                  >
                    <Search className="h-12 w-12 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">
                    {language === "en" ? "Search for Distributors" : "वितरक खोजें"}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en"
                      ? "Enter your pincode above to find authorized Agrio India distributors near you."
                      : "अपने पास अधिकृत एग्रियो इंडिया वितरकों को खोजने के लिए ऊपर अपना पिनकोड दर्ज करें।"}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

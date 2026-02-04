"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  MapPinOff,
  Loader2,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Distributor } from "@/lib/api";

function DistributorSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DistributorsPage() {
  const { language, user } = useStore();
  const { toast } = useToast();
  
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [searchedPincode, setSearchedPincode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchDistributors = useCallback(async (searchPincode: string) => {
    if (!searchPincode || searchPincode.length !== 6) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await api.getDistributors({ pincode: searchPincode });
      
      if (response.success && response.data) {
        setDistributors(response.data);
        setSearchedPincode(searchPincode);
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
    }
    
    setIsSearching(false);
  }, [language, toast]);

  // Auto-search on load if user has pincode
  useEffect(() => {
    if (user?.pincode) {
      searchDistributors(user.pincode);
    }
  }, [user?.pincode, searchDistributors]);

  const handleSearch = () => {
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
    searchDistributors(pincode);
  };

  const handleUseLocation = async () => {
    setIsLocating(true);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setHasSearched(true);
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await api.getDistributors({
              lat: latitude,
              lng: longitude,
              limit: 20,
            });
            
            if (response.success && response.data) {
              setDistributors(response.data);
              setSearchedPincode(language === "en" ? "Your Location" : "आपका स्थान");
            } else {
              setDistributors([]);
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
        () => {
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

  const copyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast({
      title: language === "en" ? "Address Copied!" : "पता कॉपी हो गया!",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {language === "en" ? "Buy Nearby" : "पास में खरीदें"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Find authorized Agrio India distributors near you."
            : "अपने पास अधिकृत एग्रियो इंडिया वितरकों को खोजें।"}
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={language === "en" ? "Enter Your Pincode" : "अपना पिनकोड दर्ज करें"}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-12"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || pincode.length !== 6} className="h-12">
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  {language === "en" ? "Search" : "खोजें"}
                </>
              )}
            </Button>
            <span className="flex items-center justify-center text-gray-500">
              {language === "en" ? "or" : "या"}
            </span>
            <Button
              variant="outline"
              onClick={handleUseLocation}
              disabled={isLocating}
              className="h-12"
            >
              {isLocating ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-5 w-5 mr-2" />
              )}
              {language === "en" ? "Use My Location" : "मेरा स्थान"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchedPincode && (
        <div className="text-sm text-muted-foreground">
          {language === "en"
            ? `Showing distributors near: ${searchedPincode}`
            : `${searchedPincode} के पास वितरक दिखा रहे हैं`}
        </div>
      )}

      {isSearching ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <DistributorSkeleton key={index} />
          ))}
        </div>
      ) : distributors.length > 0 ? (
        <div className="space-y-4">
          {distributors.map((distributor, index) => (
            <div
              key={distributor.id}
              
              
              
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Distributor Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{distributor.name}</h3>
                        {distributor.is_active && (
                          <Badge variant="success" className="text-xs">
                            {language === "en" ? "Active" : "सक्रिय"}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-primary">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${distributor.phone}`} className="hover:underline">
                          {distributor.phone}
                        </a>
                      </div>
                      
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                          {distributor.address}, {distributor.city}, {distributor.state} - {distributor.pincode}
                        </span>
                      </div>

                      {distributor.distance_km && (
                        <div className="text-sm text-primary">
                          {distributor.distance_km.toFixed(1)} {language === "en" ? "km away" : "किमी दूर"}
                        </div>
                      )}

                      {distributor.owner_name && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{language === "en" ? "Owner:" : "मालिक:"}</span>{" "}
                          {distributor.owner_name}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <a href={`tel:${distributor.phone}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          {language === "en" ? "Call" : "कॉल"}
                        </a>
                      </Button>
                      {distributor.latitude && distributor.longitude && (
                        <Button variant="outline" asChild>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${distributor.latitude},${distributor.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            {language === "en" ? "Map" : "मैप"}
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyAddress(
                            `${distributor.address}, ${distributor.city}, ${distributor.state} - ${distributor.pincode}`,
                            distributor.id
                          )
                        }
                      >
                        {copiedId === distributor.id ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {language === "en" ? "Copy Address" : "पता कॉपी करें"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPinOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === "en" ? "No Distributors Found" : "कोई वितरक नहीं मिला"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {language === "en"
                ? "We couldn't find any distributors in your area. Please try another pincode or contact our support for assistance."
                : "हमें आपके क्षेत्र में कोई वितरक नहीं मिला। कृपया दूसरा पिनकोड आज़माएं या सहायता के लिए हमारे सपोर्ट से संपर्क करें।"}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

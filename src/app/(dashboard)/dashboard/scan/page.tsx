"use client";

import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  QrCode,
  Keyboard,
  Camera,
  FlipHorizontal,
  Zap,
  Loader2,
  Gift,
  Download,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";

type ScanState = "idle" | "scanning" | "verifying" | "scratch" | "revealed" | "error";

interface WonPrize {
  name: string;
  name_hi: string;
  description?: string;
  type: string;
  value: number;
  image_url?: string;
}

export default function ScanPage() {
  const { language, addReward } = useStore();
  const { toast } = useToast();
  
  const [state, setState] = useState<ScanState>("idle");
  const [manualCode, setManualCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [wonPrize, setWonPrize] = useState<WonPrize | null>(null);
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = "qr-reader";

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // QR Code scanning using camera
  const startCamera = async () => {
    try {
      setCameraError("");
      setIsScanning(true);
      
      const html5QrCode = new Html5Qrcode(scannerElementId);
      qrCodeScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QR Code detected
          stopCamera();
          verifyCoupon(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (they're frequent during scanning)
        }
      );
    } catch (error: any) {
      console.error("Camera error:", error);
      setCameraError(
        error.name === 'NotAllowedError' 
          ? (language === "en" ? "Camera permission denied. Please allow camera access." : "कैमरा अनुमति अस्वीकृत। कृपया कैमरा पहुंच की अनुमति दें।")
          : (language === "en" ? "Failed to access camera. Please try again." : "कैमरा तक पहुंचने में विफल। कृपया पुनः प्रयास करें।")
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        await qrCodeScannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping camera:", error);
      }
      qrCodeScannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Initialize scratch canvas
  useEffect(() => {
    if (state === "scratch" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Fill with scratch surface color
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          language === "en" ? "SCRATCH HERE" : "यहाँ खुरचें",
          canvas.width / 2,
          canvas.height / 2 - 10
        );
        ctx.font = "14px Arial";
        ctx.fillText(
          language === "en" ? "to reveal your prize" : "अपना पुरस्कार जानने के लिए",
          canvas.width / 2,
          canvas.height / 2 + 15
        );
      }
    }
  }, [state, language]);

  // Scratch functionality
  const handleScratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let scratchedPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) scratchedPixels++;
    }
    const progress = (scratchedPixels / (canvas.width * canvas.height)) * 100;
    setScratchProgress(progress);

    if (progress > 50 && state === "scratch") {
      setState("revealed");
    }
  };

  // Verify and redeem coupon code using API
  const verifyCoupon = async (code: string) => {
    setState("verifying");
    setErrorMessage("");

    try {
      // Use the scan/redeem endpoint which combines verify and redeem
      const response = await api.scanAndRedeem(code);

      if (response.success && response.data) {
        const { reward, redemption } = response.data;
        
        setWonPrize({
          name: reward.name,
          name_hi: reward.name_hi,
          type: reward.type,
          value: reward.value,
          image_url: reward.image_url,
        });
        setRedemptionId(redemption.id);
        
        // Add to rewards in store
        addReward({
          id: redemption.id,
          couponCode: redemption.coupon_code,
          prize: {
            id: redemption.id,
            name: reward.name,
            nameHi: reward.name_hi,
            description: "",
            descriptionHi: "",
            value: reward.value,
            image: reward.image_url || "",
            type: reward.type.toLowerCase() as any,
          },
          productName: "",
          status: "pending",
          wonAt: redemption.scanned_at,
        });
        
        setState("scratch");
      } else {
        setState("error");
        setErrorMessage(
          response.error?.message || 
          (language === "en" ? "Invalid coupon code. Please try again." : "अमान्य कूपन कोड। कृपया पुनः प्रयास करें।")
        );
      }
    } catch (error) {
      setState("error");
      setErrorMessage(
        language === "en" ? "Something went wrong. Please try again." : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
      );
    }
  };

  // Handle manual code submission
  const handleManualSubmit = () => {
    if (manualCode.length < 6) {
      toast({
        title: language === "en" ? "Invalid Code" : "अमान्य कोड",
        description: language === "en"
          ? "Please enter a valid coupon code"
          : "कृपया एक वैध कूपन कोड दर्ज करें",
        variant: "destructive",
      });
      return;
    }
    verifyCoupon(manualCode);
  };

  // Reset state
  const resetScan = () => {
    setState("idle");
    setManualCode("");
    setErrorMessage("");
    setScratchProgress(0);
    setWonPrize(null);
    setRedemptionId(null);
  };

  // Download certificate
  const downloadCertificate = async () => {
    if (!redemptionId) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "No reward found" : "कोई पुरस्कार नहीं मिला",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.getRewardCertificate(redemptionId);
      
      if (response.success && response.data) {
        if (response.data.download_url) {
          window.open(response.data.download_url, "_blank");
        } else if (response.data.certificate_url) {
          window.open(response.data.certificate_url, "_blank");
        }
        
        toast({
          title: language === "en" ? "Certificate Ready!" : "प्रमाणपत्र तैयार!",
          description: language === "en"
            ? "Your reward certificate is ready."
            : "आपका पुरस्कार प्रमाणपत्र तैयार है।",
          variant: "success",
        });
      } else {
        toast({
          title: language === "en" ? "Coming Soon" : "जल्द आ रहा है",
          description: language === "en"
            ? "Certificate will be available after verification."
            : "सत्यापन के बाद प्रमाणपत्र उपलब्ध होगा।",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en" ? "Failed to get certificate" : "प्रमाणपत्र प्राप्त करने में विफल",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {language === "en" ? "Scan & Win" : "स्कैन और जीतें"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Scan a product QR code or enter the code manually to win exciting rewards."
            : "रोमांचक पुरस्कार जीतने के लिए उत्पाद QR कोड स्कैन करें या कोड मैन्युअल रूप से दर्ज करें।"}
        </p>
      </div>

      <>
        {/* Idle / Input State */}
        {(state === "idle" || state === "error") && (
          <div
            key="input"
            
            
            
          >
            <Tabs defaultValue={isMobile ? "scan" : "manual"} className="w-full">
              <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {isMobile && (
                  <TabsTrigger value="scan">
                    <QrCode className="h-4 w-4 mr-2" />
                    {language === "en" ? "Scan QR Code" : "QR कोड स्कैन करें"}
                  </TabsTrigger>
                )}
                <TabsTrigger value="manual">
                  <Keyboard className="h-4 w-4 mr-2" />
                  {language === "en" ? "Enter Code" : "कोड दर्ज करें"}
                </TabsTrigger>
              </TabsList>

              {/* QR Scanner Tab */}
              <TabsContent value="scan">
                <Card>
                  <CardContent className="p-6">
                    {!isScanning ? (
                      <>
                        <div id={scannerElementId} className="aspect-square max-w-sm mx-auto rounded-xl bg-gray-900 flex items-center justify-center relative overflow-hidden">
                          <div className="text-center text-white">
                            <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm opacity-70">
                              {language === "en"
                                ? "Click Start to scan QR code"
                                : "QR कोड स्कैन करने के लिए Start पर क्लिक करें"}
                            </p>
                          </div>
                        </div>
                        {cameraError && (
                          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg text-center">
                            {cameraError}
                          </div>
                        )}
                        <div className="flex gap-3 mt-4 justify-center">
                          <Button onClick={startCamera} className="w-full sm:w-auto">
                            <Camera className="h-4 w-4 mr-2" />
                            {language === "en" ? "Start Camera" : "कैमरा शुरू करें"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div id={scannerElementId} className="aspect-square max-w-sm mx-auto rounded-xl overflow-hidden" />
                        <div className="flex gap-3 mt-4 justify-center">
                          <Button variant="outline" size="sm" onClick={stopCamera}>
                            <XCircle className="h-4 w-4 mr-2" />
                            {language === "en" ? "Stop Camera" : "कैमरा बंद करें"}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manual Entry Tab */}
              <TabsContent value="manual">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Keyboard className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "en"
                          ? "Enter the unique code found on your product"
                          : "अपने उत्पाद पर मिला अद्वितीय कोड दर्ज करें"}
                      </p>
                    </div>

                    <Input
                      placeholder={language === "en" ? "Enter coupon code" : "कूपन कोड दर्ज करें"}
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                      className="text-center text-lg tracking-wider font-mono h-14"
                    />

                    {state === "error" && errorMessage && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <XCircle className="h-4 w-4" />
                        {errorMessage}
                      </div>
                    )}

                    <Button
                      onClick={handleManualSubmit}
                      className="w-full h-12"
                      disabled={manualCode.length < 6}
                    >
                      {language === "en" ? "Verify Coupon" : "कूपन सत्यापित करें"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Verifying State */}
        {state === "verifying" && (
          <div
            key="verifying"
            
            
            
          >
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "en" ? "Verifying Coupon..." : "कूपन सत्यापित हो रहा है..."}
                </h3>
                <p className="text-muted-foreground">
                  {language === "en"
                    ? "Please wait while we verify your coupon code."
                    : "कृपया प्रतीक्षा करें जब तक हम आपका कूपन कोड सत्यापित करते हैं।"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scratch Card State */}
        {state === "scratch" && wonPrize && (
          <div
            key="scratch"
            
            
            
          >
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">
                  {language === "en" ? "Scratch to Reveal Your Prize!" : "अपना पुरस्कार जानने के लिए खुरचें!"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {language === "en"
                    ? "Scratch the card below to reveal your reward"
                    : "अपना पुरस्कार जानने के लिए नीचे दिए गए कार्ड को खुरचें"}
                </p>

                <div className="relative w-72 h-48 mx-auto rounded-xl overflow-hidden border-4 border-dashed border-primary">
                  {/* Prize underneath */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <div className="text-center">
                      <Gift className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                      <p className="font-bold text-lg text-amber-800">
                        {language === "en" ? wonPrize.name : wonPrize.name_hi}
                      </p>
                      {wonPrize.value > 0 && (
                        <p className="text-amber-700">₹{wonPrize.value}</p>
                      )}
                    </div>
                  </div>

                  {/* Scratch canvas */}
                  <canvas
                    ref={canvasRef}
                    width={288}
                    height={192}
                    className="absolute inset-0 scratch-canvas"
                    onMouseDown={() => setIsDrawing(true)}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    onMouseMove={handleScratch}
                    onTouchStart={() => setIsDrawing(true)}
                    onTouchEnd={() => setIsDrawing(false)}
                    onTouchMove={handleScratch}
                  />
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  {language === "en"
                    ? `${Math.round(scratchProgress)}% scratched`
                    : `${Math.round(scratchProgress)}% खुरचा गया`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prize Revealed State */}
        {state === "revealed" && wonPrize && (
          <div
            key="revealed"
            
            
            
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-8 text-white text-center">
                <div
                  
                  
                  
                >
                  <Sparkles className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {language === "en" ? "Congratulations!" : "बधाई हो!"}
                </h2>
                <p className="opacity-90">
                  {language === "en" ? "You Won" : "आपने जीता"}
                </p>
              </div>
              <CardContent className="p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === "en" ? wonPrize.name : wonPrize.name_hi}
                </h3>
                {wonPrize.value > 0 && (
                  <p className="text-xl text-primary font-semibold mb-2">
                    ₹{wonPrize.value}
                  </p>
                )}
                <p className="text-muted-foreground mb-6">
                  {wonPrize.description || (language === "en" 
                    ? "Your reward has been credited to your account!"
                    : "आपका पुरस्कार आपके खाते में जमा कर दिया गया है!")}
                </p>

                <div className="flex gap-3 justify-center">
                  <Button onClick={downloadCertificate}>
                    <Download className="h-4 w-4 mr-2" />
                    {language === "en" ? "Download Certificate" : "प्रमाणपत्र डाउनलोड करें"}
                  </Button>
                  <Button variant="outline" onClick={resetScan}>
                    {language === "en" ? "Scan Another" : "एक और स्कैन करें"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    </div>
  );
}

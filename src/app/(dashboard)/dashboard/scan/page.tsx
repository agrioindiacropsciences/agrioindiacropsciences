"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";
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
  StopCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";

type ScanState = "idle" | "scanning" | "verify-form" | "verifying" | "scratch" | "revealed" | "error";

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

  // Verification Form State
  const [serialNumber, setSerialNumber] = useState("");
  const [authCode, setAuthCode] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [wonPrize, setWonPrize] = useState<WonPrize | null>(null);
  const [redemptionId, setRedemptionId] = useState<string | null>(null);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

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

  // 1. Start QR Scanner
  const startQRScanner = () => {
    if (isScanning) return;
    setState("scanning");
    setIsScanning(true);
  };

  // Stop QR Scanner
  const stopQRScanner = useCallback(async () => {
    if (qrCodeScannerRef.current) {
      try {
        if (qrCodeScannerRef.current.isScanning) {
          await qrCodeScannerRef.current.stop();
        }
        await qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setIsScanning(false);
  }, []);

  // Effect to manage scanner lifecycle
  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      // Small delay to ensure the DOM element is rendered and ready
      await new Promise(resolve => setTimeout(resolve, 400));

      if (!isMounted || state !== "scanning" || !isScanning) return;

      const element = document.getElementById(qrCodeRegionId);
      if (!element) {
        console.error("Scanner element not found");
        return;
      }

      try {
        // Ensure any existing instance is cleaned up
        if (qrCodeScannerRef.current) {
          try {
            if (qrCodeScannerRef.current.isScanning) {
              await qrCodeScannerRef.current.stop();
            }
            qrCodeScannerRef.current.clear();
          } catch (e) {
            console.error("Error during cleanup of old scanner:", e);
          }
        }

        const scanner = new Html5Qrcode(qrCodeRegionId);
        qrCodeScannerRef.current = scanner;

        await scanner.start(
          { facingMode: facingMode },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) handleQRScanSuccess(decodedText);
          },
          () => { } // Ignore frame-level scan failures
        );
      } catch (error) {
        console.error("QR Scanner error:", error);
        if (isMounted) {
          setIsScanning(false);
          setState("idle");

          let errorMsg = language === "en"
            ? "Unable to access camera. Please check permissions."
            : "कैमरा तक पहुंचने में असमर्थ। कृपया अनुमतियां जांचें।";

          // Contextual error for non-secure contexts (HTTP)
          if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
            errorMsg = language === "en"
              ? "Camera access requires a secure connection (HTTPS). Please use a secure site."
              : "कैमरा एक्सेस के लिए एक सुरक्षित कनेक्शन (HTTPS) की आवश्यकता है। कृपया एक सुरक्षित साइट का उपयोग करें।";
          }

          toast({
            title: language === "en" ? "Camera Error" : "कैमरा त्रुटि",
            description: errorMsg,
            variant: "destructive",
          });
        }
      }
    };

    if (state === "scanning" && isScanning) {
      initScanner();
    }

    return () => {
      isMounted = false;
    };
  }, [state, isScanning, facingMode, language, toast]);

  // 2. Handle QR Scan -> Go to Form
  const handleQRScanSuccess = async (rawCode: string) => {
    if (isProcessingScan) return;
    setIsProcessingScan(true);

    await stopQRScanner();
    console.log("Scanned Code:", rawCode);

    // Try to extract Serial & Auth from QR if format allows
    // Format assumptions: 
    // 1. JSON: { "sn": "...", "ac": "..." }
    // 2. URL params: ?sn=...&ac=...
    // 3. Pipe separated: SERIAL|AUTH
    // 4. Just Serial (user enters Auth)

    let extractedSerial = "";
    let extractedAuth = "";

    try {
      // Try JSON
      const json = JSON.parse(rawCode);
      if (json.sn || json.serial_number) extractedSerial = json.sn || json.serial_number;
      if (json.ac || json.auth_code) extractedAuth = json.ac || json.auth_code;
    } catch (e) {
      // Not JSON
      try {
        // Try URL
        const url = new URL(rawCode);
        extractedSerial = url.searchParams.get("sn") || url.searchParams.get("serial") || "";
        extractedAuth = url.searchParams.get("ac") || url.searchParams.get("auth") || "";
      } catch (e2) {
        // Not URL, try split
        if (rawCode.includes('|')) {
          const parts = rawCode.split('|');
          extractedSerial = parts[0];
          extractedAuth = parts[1] || "";
        } else {
          // Assume entire code is Serial? Or just pre-fill serial
          extractedSerial = rawCode.trim();
        }
      }
    }

    setSerialNumber(extractedSerial);
    setAuthCode(extractedAuth);

    setIsProcessingScan(false);
    setState("verify-form");
  };

  // 3. Verify & Claim (Form Submit)
  const handleSubmitVerification = async () => {
    if (!serialNumber || !authCode) {
      setErrorMessage(language === "en" ? "Both fields are required" : "दोनों फ़ील्ड आवश्यक हैं");
      return;
    }

    setState("verifying");
    setErrorMessage("");

    try {
      const res = await api.verifyProductCoupon(serialNumber, authCode);

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || "Verification failed");
      }

      const data = res.data; // { status: "WON"|"LOST", reward: {...}, redemptionId: "..." }

      if (data.status === "LOST") {
        setErrorMessage(data.message || (language === "en" ? "Better luck next time" : "अगली बार बेहतर किस्मत"));
        setState("error");
        return;
      }

      // WON
      const reward = data.reward;

      if (!reward) {
        setErrorMessage("Reward data missing");
        setState("error");
        return;
      }
      setWonPrize({
        name: reward.rewardName || reward.tierName,
        name_hi: reward.rewardNameHi || "",
        type: reward.rewardType,
        value: Number(reward.rewardValue),
        image_url: reward.imageUrl,
        description: ""
      });
      setRedemptionId(data.redemptionId || null);

      // Add to global store
      addReward({
        id: data.redemptionId || "",
        couponCode: serialNumber,
        prize: {
          id: data.redemptionId || "",
          name: reward.rewardName,
          nameHi: reward.rewardNameHi || "",
          value: Number(reward.rewardValue),
          type: reward.rewardType.toLowerCase() as "points" | "cashback" | "discount" | "gift",
          image: reward.imageUrl || "",
          description: "",
          descriptionHi: ""
        },
        productName: "Agrio Product", // Could come from API
        status: "pending", // Pending verification
        wonAt: new Date().toISOString()
      });

      setState("scratch");

    } catch (err: any) {
      setState("error");
      setErrorMessage(err.message || (language === "en" ? "Verification failed" : "सत्यापन विफल"));
    }
  };


  // Toggle camera
  const toggleCamera = () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  // Reset
  const resetScan = async () => {
    await stopQRScanner();
    setState("idle");
    setSerialNumber("");
    setAuthCode("");
    setErrorMessage("");
    setScratchProgress(0);
    setWonPrize(null);
    setRedemptionId(null);
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {language === 'en' ? 'Scan & Win' : 'स्कैन करें और जीतें'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {language === 'en' ? 'Scan the QR code on your product to verify and win rewards.' : 'पुरस्कार जीतने के लिए अपने उत्पाद पर QR कोड स्कैन करें।'}
        </p>
      </div>

      <Card className="overflow-hidden border-2 border-primary/10 shadow-xl">
        <CardContent className="p-0">

          {/* STATE: IDLE */}
          {state === "idle" && (
            <div className="p-8 flex flex-col items-center text-center space-y-6">
              <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
                <QrCode className="h-16 w-16 text-primary" />
              </div>

              <div className="space-y-3 w-full">
                <Button onClick={startQRScanner} size="lg" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/25">
                  <Camera className="mr-2 h-5 w-5" />
                  {language === 'en' ? 'Scan QR Code' : 'QR कोड स्कैन करें'}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">{language === 'en' ? 'Or' : 'या'}</span></div>
                </div>
                <Button variant="outline" onClick={() => setState("verify-form")} className="w-full">
                  <Keyboard className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Enter Code Manually' : 'मैन्युअल रूप से कोड दर्ज करें'}
                </Button>
              </div>
            </div>
          )}

          {/* STATE: SCANNING */}
          {state === "scanning" && (
            <div className="relative bg-black h-[400px]">
              <div id={qrCodeRegionId} className="w-full h-full" />

              {/* Overlay Controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button size="icon" variant="secondary" onClick={toggleCamera} className="rounded-full h-10 w-10 bg-white/20 backdrop-blur-md border-0 text-white hover:bg-white/30">
                  <FlipHorizontal className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="destructive" onClick={resetScan} className="rounded-full h-10 w-10">
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                <p className="text-white bg-black/50 backdrop-blur-sm py-2 px-4 rounded-full inline-block text-sm font-medium">
                  {language === 'en' ? 'Align QR code within the frame' : 'फ्रेम के भीतर QR कोड संरेखित करें'}
                </p>
              </div>
            </div>
          )}

          {/* STATE: VERIFY FORM */}
          {state === "verify-form" && (
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm">
                    {language === 'en' ? 'Verification Required' : 'सत्यापन आवश्यक'}
                  </h4>
                  <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                    {language === 'en' ? 'Please enter the Serial Number and 6-digit Authentic Code found on the scratch card.' : 'कृपया स्क्रैच कार्ड पर पाया गया सीरियल नंबर और 6-अंकीय प्रमाणिक कोड दर्ज करें।'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {language === 'en' ? 'Serial Number' : 'सीरियल नंबर'}
                  </label>
                  <Input
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN12345678"
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {language === 'en' ? 'Authentic Code' : 'प्रमाणिक कोड'}
                  </label>
                  <Input
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    placeholder="e.g. A1B2C3"
                    maxLength={8}
                    className="font-mono uppercase tracking-widest"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> {errorMessage}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={resetScan} className="flex-1">
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </Button>
                <Button onClick={handleSubmitVerification} className="flex-1" disabled={!serialNumber || !authCode}>
                  {language === 'en' ? 'Verify & Claim' : 'सत्यापित करें और दावा करें'}
                </Button>
              </div>
            </div>
          )}

          {/* STATE: VERIFYING */}
          {state === "verifying" && (
            <div className="p-12 flex flex-col items-center justify-center space-y-4 min-h-[300px]">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium animate-pulse">
                {language === 'en' ? 'Verifying Code...' : 'कोड सत्यापित कर रहा है...'}
              </p>
            </div>
          )}

          {/* STATE: SCRATCH */}
          {state === "scratch" && (
            <div className="p-6 text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-green-700">
                  {language === 'en' ? 'Code Verified!' : 'कोड सत्यापित!'}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? 'Scratch the card below to reveal your prize.' : 'अपना पुरस्कार जानने के लिए नीचे कार्ड खुरचें।'}
                </p>
              </div>

              <div className="relative mx-auto w-[300px] h-[300px] rounded-xl overflow-hidden shadow-2xl border-4 border-yellow-400 bg-white select-none touch-none">
                {/* Prize Underneath (Hidden initially) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
                  {wonPrize?.type === 'GIFT' && wonPrize.image_url ? (
                    <img src={wonPrize.image_url} alt="Prize" className="h-32 w-32 object-contain mb-4 drop-shadow-lg" />
                  ) : (
                    <div className="h-24 w-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner">🏆</div>
                  )}
                  <h4 className="font-bold text-xl text-yellow-800 tabular-nums">
                    {wonPrize?.type === 'CASHBACK' && '₹'}{wonPrize?.value}
                  </h4>
                  <p className="text-sm font-bold text-yellow-600 uppercase tracking-wide mt-1">
                    {language === 'en' ? wonPrize?.name : wonPrize?.name_hi}
                  </p>
                </div>

                {/* Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="absolute inset-0 w-full h-full cursor-pointer z-10"
                  onMouseDown={() => setIsDrawing(true)}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onMouseMove={handleScratch}
                  onTouchStart={() => setIsDrawing(true)}
                  onTouchEnd={() => setIsDrawing(false)}
                  onTouchMove={handleScratch}
                />
              </div>

              <p className="text-xs text-gray-400">
                {Math.round(scratchProgress)}% {language === 'en' ? 'revealed' : 'प्रकट किया'}
              </p>
            </div>
          )}

          {/* STATE: REVEALED */}
          {state === "revealed" && wonPrize && (
            <div className="p-8 text-center space-y-8 animate-in zoom-in-90 duration-500">
              <div className="relative inline-block">
                <Sparkles className="absolute -top-6 -right-6 h-12 w-12 text-yellow-400 animate-bounce" />
                <Sparkles className="absolute -bottom-2 -left-6 h-8 w-8 text-yellow-400 animate-pulse delay-75" />

                <div className="h-40 w-40 mx-auto rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 p-1 shadow-2xl">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {wonPrize.image_url ? (
                      <img src={wonPrize.image_url} className="h-28 w-28 object-contain" />
                    ) : (
                      <span className="text-5xl">🎁</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {language === 'en' ? 'Congratulations!' : 'बधाई हो!'}
                </h2>
                <p className="text-lg text-gray-600 font-medium max-w-xs mx-auto">
                  {language === 'en' ? 'You have won' : 'आपने जीता है'} <br />
                  <span className="text-primary font-bold text-xl">
                    {language === 'en' ? wonPrize.name : wonPrize.name_hi}
                  </span>
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-100 mx-auto max-w-sm">
                <p className="text-sm text-green-800">
                  {language === 'en' ? 'Your reward has been added to your wallet. Verification is pending.' : 'आपका पुरस्कार आपके वॉलेट में जोड़ दिया गया है। सत्यापन लंबित है।'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={resetScan} className="w-full h-12 text-lg font-bold">
                  {language === 'en' ? 'Scan Another' : 'दूसरा स्कैन करें'}
                </Button>
                <Link href="/dashboard/rewards" className="w-full">
                  <Button variant="outline" className="w-full">
                    {language === 'en' ? 'View My Rewards' : 'मेरे पुरस्कार देखें'}
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* STATE: ERROR */}
          {state === "error" && (
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-900">
                  {language === 'en' ? 'Verification Failed' : 'सत्यापन विफल'}
                </h3>
                <p className="text-gray-600 max-w-xs mx-auto">
                  {errorMessage}
                </p>
              </div>

              <Button onClick={() => setState("verify-form")} className="w-full">
                {language === 'en' ? 'Try Again' : 'पुनः प्रयास करें'}
              </Button>
              <Button variant="ghost" onClick={resetScan} className="w-full">
                {language === 'en' ? 'Back to Scanner' : 'स्कैनर पर वापस जाएं'}
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      {state === 'idle' && (
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-xs mx-auto">
          {language === 'en' ? 'Protected by anti-fraud technology. Each code can only be used once.' : 'एंटी-फ्रॉड तकनीक द्वारा सुरक्षित। प्रत्येक कोड का उपयोग केवल एक बार किया जा सकता है।'}
        </p>
      )}
    </div>
  );
}

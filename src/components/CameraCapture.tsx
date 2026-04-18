"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsInitializing(false);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
        setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = () => {
    if (capturedImage) {
      // Convert data URL to File object
      const byteString = atob(capturedImage.split(",")[1]);
      const mimeString = capturedImage.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], `owner_selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
      
      onCapture(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-2xl aspect-[3/4]">
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p>Accessing Camera...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
            <X className="h-12 w-12 text-red-500 mb-4" />
            <p className="font-semibold text-lg mb-2">Camera Error</p>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <Button variant="outline" onClick={onCancel}>Close</Button>
          </div>
        )}

        {!isInitializing && !error && (
          <>
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover mirror"
                />
                <Button 
                  onClick={takeSnapshot}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full border-4 border-white bg-primary p-0 shadow-xl"
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </>
            ) : (
              <>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-6">
                  <Button 
                    variant="outline"
                    onClick={retake}
                    className="flex-1 bg-white/20 backdrop-blur-md border-white/30 text-white hover:bg-white/40"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Retake
                  </Button>
                  <Button 
                    onClick={confirm}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" /> Confirm
                  </Button>
                </div>
              </>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {!isInitializing && !error && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm font-medium text-slate-600">Please take a clear photo of your face</p>
          <Button variant="ghost" className="text-slate-500" onClick={onCancel}>Cancel</Button>
        </div>
      )}

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}

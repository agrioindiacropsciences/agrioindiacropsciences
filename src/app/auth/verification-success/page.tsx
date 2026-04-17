"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerificationSuccessPage() {
  useEffect(() => {
    // Attempt to notify the opener if exists
    if (window.opener) {
      try {
        window.opener.postMessage("verification_complete", "*");
      } catch (e) {
        console.error("Failed to notify opener", e);
      }
    }
    
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      window.close();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your DigiLocker verification has been completed. You can safely close this window now.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => window.close()} 
            className="w-full h-12 rounded-xl"
          >
            Close Window
          </Button>
          <p className="text-xs text-gray-400">
            This window will close automatically in a few seconds.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

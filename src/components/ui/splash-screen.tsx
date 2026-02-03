"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TractorLoader } from "./tractor-loader";

const SPLASH_DURATION_MS = 2000;
const SPLASH_STORAGE_KEY = "agrio_splash_shown";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const shown = typeof window !== "undefined" && sessionStorage.getItem(SPLASH_STORAGE_KEY);
    if (shown) {
      setIsVisible(false);
      return;
    }
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50/80 backdrop-blur-sm"
        >
          <TractorLoader size="lg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

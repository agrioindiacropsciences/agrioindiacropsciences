"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function TractorScroll() {
  const [isClient, setIsClient] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Smooth spring animation for the tractor movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform scroll progress to vertical position
  const tractorY = useTransform(smoothProgress, [0, 1], ["8%", "88%"]);
  
  // Wheel rotation based on scroll
  const wheelRotation = useTransform(smoothProgress, [0, 1], [0, 1440]);

  // Show component only after initial mount (to avoid SSR issues)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on server
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed right-2 top-0 bottom-0 z-[60] hidden lg:flex flex-col items-center pointer-events-none">
      {/* Minimal scroll track - thin line */}
      <div className="absolute right-5 top-[8%] bottom-[8%] w-[2px] rounded-full bg-gray-300/30" />

      {/* Realistic Tractor */}
      <motion.div
        className="absolute right-0 w-14 h-14"
        style={{ top: tractorY }}
      >
        <svg
          viewBox="0 0 64 48"
          className="w-full h-full"
          style={{ filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.3))" }}
        >
          <defs>
            {/* Gradients for realistic look */}
            <linearGradient id="bodyGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="hoodGreen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
            <linearGradient id="wheelBlack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#404040" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient id="hubGray" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
          </defs>

          {/* Engine Hood */}
          <rect x="38" y="14" width="18" height="14" rx="2" fill="url(#hoodGreen)" />
          <rect x="40" y="16" width="6" height="4" rx="1" fill="#0f172a" opacity="0.6" />
          
          {/* Exhaust Pipe */}
          <rect x="52" y="8" width="3" height="8" rx="1" fill="#525252" />
          <ellipse cx="53.5" cy="7" rx="2" ry="1.5" fill="#737373" />
          
          {/* Main Body */}
          <rect x="8" y="10" width="32" height="20" rx="3" fill="url(#bodyGreen)" />
          
          {/* Cabin */}
          <rect x="10" y="4" width="18" height="14" rx="2" fill="#1e3a5f" />
          {/* Cabin Window */}
          <rect x="12" y="6" width="14" height="8" rx="1" fill="#7dd3fc" opacity="0.85" />
          {/* Window frame */}
          <line x1="19" y1="6" x2="19" y2="14" stroke="#1e3a5f" strokeWidth="1" />
          
          {/* Fender over rear wheel */}
          <path d="M8 30 Q8 22 16 22 L32 22 Q40 22 40 30" fill="url(#bodyGreen)" />
          
          {/* Hitch */}
          <rect x="2" y="24" width="6" height="4" rx="1" fill="#525252" />
          
          {/* Rear Wheel - Large */}
          <motion.g style={{ rotate: wheelRotation, transformOrigin: "22px 36px" }}>
            <circle cx="22" cy="36" r="11" fill="url(#wheelBlack)" />
            {/* Tire treads */}
            {[...Array(12)].map((_, i) => (
              <rect
                key={i}
                x="20.5"
                y="25"
                width="3"
                height="3"
                fill="#0a0a0a"
                rx="0.5"
                transform={`rotate(${i * 30} 22 36)`}
              />
            ))}
            {/* Hub */}
            <circle cx="22" cy="36" r="5" fill="url(#hubGray)" />
            <circle cx="22" cy="36" r="2" fill="#d4d4d4" />
            {/* Spokes */}
            {[0, 60, 120].map((angle) => (
              <line
                key={angle}
                x1="22"
                y1="31"
                x2="22"
                y2="41"
                stroke="#4b5563"
                strokeWidth="1.5"
                transform={`rotate(${angle} 22 36)`}
              />
            ))}
          </motion.g>

          {/* Front Wheel - Smaller */}
          <motion.g style={{ rotate: wheelRotation, transformOrigin: "50px 40px" }}>
            <circle cx="50" cy="40" r="7" fill="url(#wheelBlack)" />
            {/* Tire treads */}
            {[...Array(8)].map((_, i) => (
              <rect
                key={i}
                x="49"
                y="33"
                width="2"
                height="2"
                fill="#0a0a0a"
                rx="0.3"
                transform={`rotate(${i * 45} 50 40)`}
              />
            ))}
            {/* Hub */}
            <circle cx="50" cy="40" r="3" fill="url(#hubGray)" />
            <circle cx="50" cy="40" r="1.2" fill="#d4d4d4" />
          </motion.g>

          {/* Steering wheel hint */}
          <circle cx="24" cy="12" r="2" fill="#374151" opacity="0.6" />
        </svg>
      </motion.div>
    </div>
  );
}

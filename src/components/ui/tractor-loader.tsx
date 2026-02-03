"use client";

import React from "react";
import { motion } from "framer-motion";

interface TractorLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function TractorLoader({ size = "md", className = "", showLabel = true }: TractorLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* 3D Tractor with perspective */}
      <motion.div
        className={`relative ${sizeMap[size]} [perspective:800px]`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Smoke puffs from exhaust */}
        <div className="absolute -top-2 right-0 w-full h-8 overflow-visible pointer-events-none">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute right-2 top-0 w-4 h-4 rounded-full bg-gray-300/60 blur-sm"
              animate={{
                y: [0, -20, -40],
                x: [0, 8, 16],
                opacity: [0.6, 0.4, 0],
                scale: [0.8, 1.2, 1.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* 3D rotating tractor container */}
        <motion.div
          className="w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={{
            rotateY: [0, 15, -15, 0],
            rotateX: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            viewBox="0 0 64 48"
            className="w-full h-full drop-shadow-lg"
            style={{ transform: "translateZ(20px)" }}
          >
            <defs>
              <linearGradient id="loader-bodyGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
              <linearGradient id="loader-hoodGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#166534" />
              </linearGradient>
              <linearGradient id="loader-wheelBlack" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#404040" />
                <stop offset="50%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </linearGradient>
              <linearGradient id="loader-hubGray" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9ca3af" />
                <stop offset="100%" stopColor="#6b7280" />
              </linearGradient>
            </defs>

            {/* Engine Hood */}
            <rect x="38" y="14" width="18" height="14" rx="2" fill="url(#loader-hoodGreen)" />
            <rect x="40" y="16" width="6" height="4" rx="1" fill="#0f172a" opacity="0.6" />

            {/* Exhaust Pipe */}
            <rect x="52" y="8" width="3" height="8" rx="1" fill="#525252" />
            <ellipse cx="53.5" cy="7" rx="2" ry="1.5" fill="#737373" />

            {/* Main Body */}
            <rect x="8" y="10" width="32" height="20" rx="3" fill="url(#loader-bodyGreen)" />

            {/* Cabin */}
            <rect x="10" y="4" width="18" height="14" rx="2" fill="#1e3a5f" />
            <rect x="12" y="6" width="14" height="8" rx="1" fill="#7dd3fc" opacity="0.85" />
            <line x1="19" y1="6" x2="19" y2="14" stroke="#1e3a5f" strokeWidth="1" />

            {/* Fender */}
            <path d="M8 30 Q8 22 16 22 L32 22 Q40 22 40 30" fill="url(#loader-bodyGreen)" />

            {/* Hitch */}
            <rect x="2" y="24" width="6" height="4" rx="1" fill="#525252" />

            {/* Rear Wheel - Animated */}
            <motion.g
              style={{ transformOrigin: "22px 36px" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="22" cy="36" r="11" fill="url(#loader-wheelBlack)" />
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
              <circle cx="22" cy="36" r="5" fill="url(#loader-hubGray)" />
              <circle cx="22" cy="36" r="2" fill="#d4d4d4" />
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

            {/* Front Wheel - Animated */}
            <motion.g
              style={{ transformOrigin: "50px 40px" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="50" cy="40" r="7" fill="url(#loader-wheelBlack)" />
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
              <circle cx="50" cy="40" r="3" fill="url(#loader-hubGray)" />
              <circle cx="50" cy="40" r="1.2" fill="#d4d4d4" />
            </motion.g>

            <circle cx="24" cy="12" r="2" fill="#374151" opacity="0.6" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Loading text with dots */}
      {showLabel && (
        <motion.p
          className="text-sm text-muted-foreground font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading
          <span className="loading-dots" />
        </motion.p>
      )}
    </div>
  );
}

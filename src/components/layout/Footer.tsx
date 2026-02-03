"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Youtube, 
  Instagram,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { AnimatedSection } from "@/components/ui/animated-section";

// India Map Component with state names
function IndiaMapWithStates() {
  const { language } = useStore();
  
  // State markers with names
  const stateMarkers = [
    { id: "punjab", label: "Punjab", labelHi: "पंजाब", x: "22%", y: "16%" },
    { id: "haryana", label: "Haryana", labelHi: "हरियाणा", x: "26%", y: "22%" },
    { id: "delhi", label: "Delhi", labelHi: "दिल्ली", x: "29%", y: "25%" },
    { id: "up", label: "UP", labelHi: "यूपी", x: "40%", y: "30%" },
    { id: "bihar", label: "Bihar", labelHi: "बिहार", x: "56%", y: "32%" },
    { id: "jharkhand", label: "Jharkhand", labelHi: "झारखंड", x: "54%", y: "40%" },
  ];

  return (
    <div className="relative w-full max-w-[400px] mx-auto">
      {/* India Map Image */}
      <div className="relative">
        <Image
          src="/in.svg"
          alt="India Map"
          width={400}
          height={440}
          className="w-full h-auto"
        />
        
        {/* State Markers with Labels */}
        {stateMarkers.map((state, index) => (
          <motion.div
            key={state.id}
            className="absolute flex items-center gap-1"
            style={{ left: state.x, top: state.y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 * index, duration: 0.4 }}
          >
            {/* Marker dot */}
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-lg" />
              <motion.div
                className="absolute inset-0 h-3 w-3 rounded-full bg-red-500"
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2 }}
              />
            </div>
            {/* State name label */}
            <span className="text-[11px] font-semibold text-white bg-gray-800/80 px-1.5 py-0.5 rounded whitespace-nowrap">
              {language === "en" ? state.label : state.labelHi}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const quickLinks = [
  { href: "/", label: "Home", labelHi: "होम" },
  { href: "/products", label: "Products", labelHi: "उत्पाद" },
  { href: "/about", label: "About Us", labelHi: "हमारे बारे में" },
  { href: "/contact", label: "Contact Us", labelHi: "संपर्क करें" },
  { href: "/scan-win", label: "Scan & Win", labelHi: "स्कैन और जीतें" },
  { href: "/buy-nearby", label: "Buy Nearby", labelHi: "पास में खरीदें" },
  { href: "/best-selling", label: "Best Selling", labelHi: "बेस्ट सेलिंग" },
  { href: "/privacy-policy", label: "Privacy Policy", labelHi: "गोपनीयता नीति" },
  { href: "/terms", label: "Terms of Service", labelHi: "सेवा की शर्तें" },
];

const socialLinks = [
  { href: "https://www.instagram.com/kheticare___?igsh=b2h1Ymlud2o1dXhm&utm_source=qr", icon: Instagram, label: "Instagram", bgColor: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" },
  { href: "https://www.facebook.com/kheticare", icon: Facebook, label: "Facebook", bgColor: "bg-[#1877F2]" },
  { href: "https://youtube.com/@kheticare?si=Ovl1zcnOIhaw1MND", icon: Youtube, label: "YouTube", bgColor: "bg-[#FF0000]" },
];

export function Footer() {
  const { language } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-black" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
      
      {/* Main Footer Content */}
      <div className="relative container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* India Map - Large */}
          <AnimatedSection direction="left" className="lg:col-span-1">
            <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {language === "en" ? "Our Presence" : "हमारी उपस्थिति"}
            </h4>
            <IndiaMapWithStates />
            <p className="text-gray-400 text-sm mt-4 text-center">
              {language === "en" ? "Serving farmers across North India" : "उत्तर भारत के किसानों की सेवा में"}
            </p>
          </AnimatedSection>

          {/* Quick Links */}
          <AnimatedSection direction="up" delay={0.2} className="lg:col-span-1">
            <h4 className="text-white font-bold text-xl mb-6">
              {language === "en" ? "Quick Links" : "त्वरित लिंक"}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    {language === "en" ? link.label : link.labelHi}
                  </Link>
                </li>
              ))}
            </ul>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection direction="right" delay={0.3} className="lg:col-span-1">
            <h4 className="text-white font-bold text-xl mb-6">
              {language === "en" ? "Contact Us" : "संपर्क करें"}
            </h4>
            
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <Image
                src="/logo.svg"
                alt="Agrio India Logo"
                width={60}
                height={60}
                className="h-14 w-14 object-contain"
              />
              <div>
                <h3 className="text-white font-bold text-xl">Agrio</h3>
                <p className="text-primary text-sm font-medium">India Crop Science Pvt. Ltd.</p>
              </div>
            </div>

            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <span className="text-gray-400">
                  E-31 Industrial Area,<br />
                  Sikandrabad, Bulandshahr<br />
                  Uttar Pradesh - 203205
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <a
                  href="tel:+919520609999"
                  className="text-gray-400 hover:text-primary transition-colors text-lg"
                >
                  +91 95206 09999
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <a
                  href="mailto:agrioindiacropsciences@gmail.com"
                  className="text-gray-400 hover:text-primary transition-colors break-all"
                >
                  agrioindiacropsciences@gmail.com
                </a>
              </li>
            </ul>
          </AnimatedSection>
        </div>
      </div>

      {/* Social Links & Copyright Bar */}
      <div className="relative border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Company Name */}
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold">
                AGRIO INDIA CROP SCIENCE PVT. LTD.
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                © {currentYear} {language === "en" ? "All Rights Reserved." : "सर्वाधिकार सुरक्षित।"}
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-white transition-all duration-300 hover:scale-110 shadow-lg ${social.bgColor}`}
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  title={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="relative border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <p className="text-xs text-white text-center">
            Designed and developed by{" "}
            <a
              href="mailto:fourrquarks@gmail.com"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              fourQuarks
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

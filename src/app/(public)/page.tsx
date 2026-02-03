"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  QrCode,
  MapPin,
  Leaf,
  Languages,
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  Phone,
  MessageCircle,
  Star,
  Award,
  Shield,
  Sparkles,
  ChevronRight,
  Beaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import {
  AnimatedSection,
  AnimatedContainer,
  AnimatedItem,
  CountUp,
} from "@/components/ui/animated-section";

const features = [
  {
    icon: QrCode,
    title: "Scan & Win Rewards",
    titleHi: "स्कैन करें और पुरस्कार जीतें",
    description: "Scan product QR codes to earn exciting rewards directly.",
    descriptionHi: "उत्पाद QR कोड स्कैन करके सीधे रोमांचक पुरस्कार अर्जित करें।",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: MapPin,
    title: "Nearby Distributors",
    titleHi: "नजदीकी वितरक",
    description: "Easily locate our trusted distributors in your area.",
    descriptionHi: "अपने क्षेत्र में हमारे विश्वसनीय वितरकों को आसानी से खोजें।",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    icon: Leaf,
    title: "Farmer-Friendly Products",
    titleHi: "किसान अनुकूल उत्पाद",
    description: "High-quality products designed for the modern Indian farmer.",
    descriptionHi: "आधुनिक भारतीय किसान के लिए डिज़ाइन किए गए उच्च गुणवत्ता वाले उत्पाद।",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: Languages,
    title: "Hindi Support",
    titleHi: "हिंदी सहायता",
    description: "Access all information and support in Hindi.",
    descriptionHi: "हिंदी में सभी जानकारी और सहायता प्राप्त करें।",
    gradient: "from-orange-500 to-amber-600",
  },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Assured Quality",
    titleHi: "गुणवत्ता की गारंटी",
    description: "Our products undergo rigorous testing to ensure the highest quality standards.",
    descriptionHi: "हमारे उत्पाद उच्चतम गुणवत्ता मानकों को सुनिश्चित करने के लिए कठोर परीक्षण से गुजरते हैं।",
    stat: "100%",
    statLabel: "Quality Tested",
    statLabelHi: "गुणवत्ता परीक्षित",
  },
  {
    icon: TrendingUp,
    title: "Better Crop Yield",
    titleHi: "बेहतर फसल उपज",
    description: "Formulated to boost crop health and maximize your agricultural output.",
    descriptionHi: "फसल स्वास्थ्य को बढ़ावा देने और कृषि उत्पादन को अधिकतम करने के लिए तैयार।",
    stat: "40%",
    statLabel: "Yield Increase",
    statLabelHi: "उपज में वृद्धि",
  },
  {
    icon: Users,
    title: "Trusted By Farmers",
    titleHi: "किसानों का विश्वास",
    description: "Millions of farmers across India trust us for their crop care needs.",
    descriptionHi: "भारत भर में लाखों किसान अपनी फसल देखभाल की जरूरतों के लिए हम पर भरोसा करते हैं।",
    stat: "2L+",
    statLabel: "Happy Farmers",
    statLabelHi: "खुश किसान",
  },
  {
    icon: Award,
    title: "Wide Range of Products",
    titleHi: "उत्पादों की विस्तृत श्रृंखला",
    description: "A comprehensive portfolio of agrochemicals for various crops and needs.",
    descriptionHi: "विभिन्न फसलों और जरूरतों के लिए कृषि रसायनों का व्यापक पोर्टफोलियो।",
    stat: "100+",
    statLabel: "Products",
    statLabelHi: "उत्पाद",
  },
];

const steps = [
  {
    step: 1,
    title: "Buy a Product",
    titleHi: "उत्पाद खरीदें",
    description: "Purchase any of our trusted Agrio India crop science products from a nearby store.",
    descriptionHi: "पास की दुकान से हमारे किसी भी विश्वसनीय एग्रियो इंडिया क्रॉप साइंस उत्पाद को खरीदें।",
    icon: Package,
  },
  {
    step: 2,
    title: "Scratch & Scan Code",
    titleHi: "खुरचें और कोड स्कैन करें",
    description: "Find the unique scratch code on the product packaging and easily scan it with your phone.",
    descriptionHi: "उत्पाद पैकेजिंग पर अद्वितीय स्क्रैच कोड खोजें और आसानी से अपने फोन से स्कैन करें।",
    icon: QrCode,
  },
  {
    step: 3,
    title: "Win Exciting Rewards",
    titleHi: "रोमांचक पुरस्कार जीतें",
    description: "Instantly win amazing rewards, from cashback to valuable farming tools.",
    descriptionHi: "तुरंत अद्भुत पुरस्कार जीतें, कैशबैक से लेकर मूल्यवान कृषि उपकरण तक।",
    icon: Star,
  },
];

const stats = [
  { value: 200000, suffix: "+", label: "Happy Farmers", labelHi: "खुश किसान", icon: Users },
  { value: 100, suffix: "+", label: "Products", labelHi: "उत्पाद", icon: Package },
  { value: 15, suffix: "+", label: "States", labelHi: "राज्य", icon: MapPin },
  { value: 500, suffix: "+", label: "Distributors", labelHi: "वितरक", icon: Users },
];

// Best Selling Products Data (same as best-selling page)
const bestSellingProducts = [
  {
    id: "1",
    name: "Agrio Formula",
    nameHi: "एग्रियो फॉर्मूला",
    technical: "Chlorantraniliprole 18.5% SC",
    technicalHi: "क्लोरेंट्रानिलिप्रोल 18.5% SC",
    price: 1500,
    image: "/product1.JPG",
    category: "Insecticide",
    categoryHi: "कीटनाशक",
    gradient: "from-red-500 to-orange-500",
    bgGradient: "from-red-50 to-orange-50",
  },
  {
    id: "2",
    name: "Agrio Chakravyuh",
    nameHi: "एग्रियो चक्रव्यूह",
    technical: "Azoxystrobin 2.5% + Thiophanate Methyl 11.25% + Thiamethoxam 25% FS",
    technicalHi: "एज़ोक्सीस्ट्रोबिन 2.5% + थायोफैनेट मिथाइल 11.25% + थायमेथोक्साम 25% FS",
    price: 1500,
    packSize: "500ml",
    image: "/product2.JPG",
    category: "Fungicide",
    categoryHi: "फफूंदनाशक",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
  },
  {
    id: "3",
    name: "Agrio Rocket",
    nameHi: "एग्रियो रॉकेट",
    technical: "Triacontanol 0.05% GR",
    technicalHi: "ट्राइकॉन्टानॉल 0.05% GR",
    dosage: "4kg/Acre",
    dosageHi: "4kg/एकड़",
    price: 680,
    packSize: "4kg",
    image: "/product3.JPG",
    category: "Plant Growth Regulator",
    categoryHi: "पौधा वृद्धि नियामक",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
  },
  {
    id: "4",
    name: "Agrio Hercules",
    nameHi: "एग्रियो हरक्यूलिस",
    technical: "Halosulfuron Methyl 75% WG",
    technicalHi: "हैलोसल्फ्यूरॉन मिथाइल 75% WG",
    dosage: "36gm/Acre",
    dosageHi: "36gm/एकड़",
    price: 1100,
    packSize: "36gm",
    image: "/product4.JPG",
    category: "Herbicide",
    categoryHi: "खरपतवारनाशक",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
];

export default function HomePage() {
  const { language } = useStore();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20 lg:pt-24">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50" />
          
          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-0 -left-40 w-96 h-96 bg-gradient-to-r from-primary/30 to-emerald-400/30 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 -right-40 w-80 h-80 bg-gradient-to-l from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-t from-green-400/20 to-teal-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 60, 0],
              y: [0, -60, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/40"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
          ))}

          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, #22c55e 1px, transparent 1px), linear-gradient(to bottom, #22c55e 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          
          {/* Mobile background image */}
          <div className="absolute inset-0 lg:hidden overflow-hidden">
            <Image
              src="/home.png"
              alt="Agrio India"
              fill
              className="object-cover opacity-75"
              style={{ 
                filter: 'blur(2px)',
                objectPosition: 'right center'
              }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/15 to-white/25" />
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Badge with shimmer effect */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-sm font-semibold text-primary">
                    {language === "en" ? "Premium Agrochemicals" : "प्रीमियम कृषि रसायन"}
                  </span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </motion.div>
              </motion.div>

              {/* Main Heading with text reveal */}
              <div className="space-y-2 -mt-[12%]">
                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span 
                    className="block overflow-hidden"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="inline-block text-gray-900">Agrio Sampan</span>
                  </motion.span>
                  <motion.span 
                    className="block overflow-hidden"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="inline-block bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                      Kisan
                    </span>
                  </motion.span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-hindi font-semibold"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  भारतीय किसान की पहली पसंद
                </motion.p>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="text-base lg:text-lg text-gray-500 max-w-lg leading-relaxed"
              >
                {language === "en"
                  ? "Empowering Indian farmers with high-quality crop solutions for sustainable and prosperous farming."
                  : "टिकाऊ और समृद्ध खेती के लिए उच्च गुणवत्ता वाले फसल समाधानों के साथ भारतीय किसानों को सशक्त बनाना।"}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    size="lg" 
                    className="text-base px-8 h-14 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 rounded-full border-0 group"
                  >
                    <Link href="/products">
                      {language === "en" ? "Explore Products" : "उत्पाद देखें"}
                      <motion.span
                        className="ml-2"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg" 
                    className="text-base px-8 h-14 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-300 rounded-full bg-white/80 backdrop-blur-sm group"
                  >
                    <Link href="/auth">
                      <QrCode className="mr-2 h-5 w-5 text-primary" />
                      {language === "en" ? "Scan & Win" : "स्कैन और जीतें"}
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Play Store App Download */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75 }}
              >
                <Link href="#" className="group inline-flex items-center gap-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 rounded-2xl p-4 pr-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Play Store Icon */}
                  <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#00C853] via-[#FFEA00] via-[#FF6D00] to-[#D500F9] p-[2px]">
                      <div className="h-full w-full rounded-xl bg-gray-900 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                        </svg>
                      </div>
                    </div>
                    {/* Live badge */}
                    <motion.div 
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-gray-900"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {language === "en" ? "Now Live on" : "अभी उपलब्ध"}
                    </span>
                    <span className="text-white font-bold text-lg group-hover:text-green-400 transition-colors">
                      Google Play Store
                    </span>
                    <span className="text-xs text-gray-400">
                      {language === "en" ? "Download the App" : "ऐप डाउनलोड करें"}
                    </span>
                  </div>
                  
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                  </motion.div>
                </Link>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 }}
                className="flex flex-wrap gap-6 lg:gap-10 pt-6 lg:pt-8"
              >
                {stats.slice(0, 3).map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-emerald-500/20 transition-all duration-300"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <stat.icon className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                          <CountUp end={stat.value} suffix={stat.suffix} />
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500 font-medium">
                          {language === "en" ? stat.label : stat.labelHi}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Decorative ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-[110%] h-[110%] rounded-full border-2 border-dashed border-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
              </div>
              
              {/* Main Image Container - Creative Shape */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                {/* Gradient background blob */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary via-emerald-400 to-teal-500 rounded-[3rem] blur-2xl opacity-30" />
                
                {/* Outer frame with gradient border */}
                <div className="relative p-[3px] rounded-[2.5rem] bg-gradient-to-br from-primary via-emerald-400 to-teal-400">
                  {/* Inner white frame */}
                  <div className="p-[6px] rounded-[2.4rem] bg-white">
                    {/* Image container with unique shape */}
                    <div className="relative h-[480px] xl:h-[540px] w-full rounded-[2.2rem] overflow-hidden">
                      <Image
                        src="/home.png"
                        alt="Agrio India - Premium Agrochemicals"
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority
                      />
                      
                      {/* Premium gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-amber-500/10" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
                      
                      {/* Decorative corner accents */}
                      <div className="absolute top-0 left-0 w-24 h-24">
                        <div className="absolute top-4 left-4 w-12 h-[2px] bg-white/60" />
                        <div className="absolute top-4 left-4 w-[2px] h-12 bg-white/60" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-24 h-24">
                        <div className="absolute bottom-4 right-4 w-12 h-[2px] bg-white/60" />
                        <div className="absolute bottom-4 right-4 w-[2px] h-12 bg-white/60" />
                      </div>

                      {/* Bottom info bar */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 1.2 }}
                        className="absolute bottom-0 inset-x-0 p-5"
                      >
                        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">2,00,000+</p>
                              <p className="text-xs text-gray-500">{language === "en" ? "Happy Farmers" : "खुश किसान"}</p>
                            </div>
                          </div>
                          <div className="h-8 w-[1px] bg-gray-200" />
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">15+</p>
                              <p className="text-xs text-gray-500">{language === "en" ? "States" : "राज्य"}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-secondary/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">
              {language === "en" ? "Why Choose Us" : "हमें क्यों चुनें"}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {language === "en" ? "Everything You Need for" : "सफल खेती के लिए"}
              <span className="gradient-text block">{language === "en" ? "Successful Farming" : "सब कुछ यहाँ है"}</span>
            </h2>
          </AnimatedSection>

          <AnimatedContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => (
              <AnimatedItem key={index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <CardContent className="p-8 text-center relative">
                      {/* Gradient background on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                      
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-xl mb-3">
                        {language === "en" ? feature.title : feature.titleHi}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {language === "en" ? feature.description : feature.descriptionHi}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/road-middle-sugar-cane-field-sunny-day-with-mountain-back.jpg"
            alt="Scenic agricultural field"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <AnimatedContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
            {stats.map((stat, index) => (
              <AnimatedItem key={index} direction="scale">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center text-white p-6"
                >
                  <p className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                    <CountUp end={stat.value} suffix={stat.suffix} duration={2} />
                  </p>
                  <p className="text-white/80 text-lg">
                    {language === "en" ? stat.label : stat.labelHi}
                  </p>
                </motion.div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="py-24 bg-gradient-section relative">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-4 px-4 py-1">
              <Star className="h-4 w-4 mr-2" />
              {language === "en" ? "Top Rated" : "सर्वोच्च रेटेड"}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {language === "en" ? "Best Selling Products" : "बेस्ट सेलिंग उत्पाद"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {language === "en"
                ? "Trusted solutions for a bountiful harvest, chosen by farmers across India."
                : "भारत भर के किसानों द्वारा चुने गए, भरपूर फसल के लिए विश्वसनीय समाधान।"}
            </p>
          </AnimatedSection>

          {/* Products Grid */}
          <AnimatedContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {bestSellingProducts.map((product, index) => (
              <AnimatedItem key={product.id}>
                  <Card className="group overflow-hidden h-full border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white">
                    {/* Gradient Top Border */}
                    <div className={`h-1 bg-gradient-to-r ${product.gradient}`} />
                    
                    {/* Product Image Section */}
                    <div className="relative h-52 bg-white overflow-hidden">
                      {/* Main Image */}
                      <div className="relative h-full w-full">
                        <Image
                          src={product.image}
                          alt={language === "en" ? product.name : product.nameHi}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      
                      {/* Rank Badge */}
                      <div
                        className={`absolute top-3 left-3 h-9 w-9 rounded-lg flex items-center justify-center font-bold text-white shadow-lg bg-gradient-to-br ${
                          index === 0 ? "from-yellow-400 to-amber-500" :
                          index === 1 ? "from-gray-300 to-gray-500" :
                          index === 2 ? "from-amber-600 to-amber-700" :
                          product.gradient
                        }`}
                      >
                        <span className="text-sm">#{index + 1}</span>
                      </div>
                      
                      {/* Best Seller Badge */}
                      <Badge className="absolute top-3 right-3 bg-white/95 text-gray-900 border-0 shadow-md text-xs px-2 py-1">
                        <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                        {language === "en" ? "Best" : "बेस्ट"}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      {/* Category */}
                      <Badge className={`mb-2 bg-gradient-to-r ${product.gradient} text-white border-0 text-xs`}>
                        {language === "en" ? product.category : product.categoryHi}
                      </Badge>

                      {/* Product Name */}
                      <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {language === "en" ? product.name : product.nameHi}
                      </h3>

                      {/* Technical Composition */}
                      <div className="flex items-start gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                        <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${product.gradient} flex items-center justify-center shrink-0`}>
                          <Beaker className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                          {language === "en" ? product.technical : product.technicalHi}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <p className={`text-lg font-bold bg-gradient-to-r ${product.gradient} bg-clip-text text-transparent`}>₹{product.price}</p>
                          {product.packSize && (
                            <p className="text-[10px] text-gray-500">per {product.packSize}</p>
                          )}
                        </div>
                        <Button asChild size="sm" className={`shadow-md bg-gradient-to-r ${product.gradient} hover:opacity-90 border-0 h-8 text-xs`}>
                          <Link href="/contact">
                            {language === "en" ? "Enquire" : "पूछताछ"}
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              </AnimatedItem>
            ))}
          </AnimatedContainer>

          <AnimatedSection delay={0.4} className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-2 hover:bg-primary hover:text-white transition-all">
              <Link href="/best-selling">
                {language === "en" ? "View All Best Sellers" : "सभी बेस्ट सेलर देखें"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* How It Works - Scan & Win */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-50">
          <motion.div
            className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-primary/40 to-emerald-500/40 rounded-full blur-[100px]"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-amber-500/30 to-orange-500/30 rounded-full blur-[100px]"
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-t from-purple-500/20 to-pink-500/20 rounded-full blur-[80px]"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <motion.div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <QrCode className="h-5 w-5 text-amber-400" />
              </motion.div>
              <span className="text-white/90 font-semibold">
                {language === "en" ? "Scan & Win" : "स्कैन और जीतें"}
              </span>
              <motion.span 
                className="h-2 w-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              {language === "en" ? "Simple Steps to Your" : "आपके पुरस्कारों के लिए"}
              <span className="block mt-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                {language === "en" ? "Rewards" : "सरल कदम"}
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {language === "en"
                ? "Follow these three easy steps to start winning. It's simple, quick, and rewarding."
                : "जीतना शुरू करने के लिए इन तीन आसान चरणों का पालन करें। यह सरल, त्वरित और फायदेमंद है।"}
            </p>
          </AnimatedSection>

          {/* Steps - Horizontal Timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px]">
              <div className="w-full h-full bg-gradient-to-r from-primary via-amber-400 to-orange-500 rounded-full" />
              <motion.div 
                className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white to-transparent"
                animate={{ x: ["0%", "400%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            
            <AnimatedContainer className="grid md:grid-cols-3 gap-8 relative z-10" staggerDelay={0.2}>
              {steps.map((step, index) => (
                <AnimatedItem key={step.step} direction="up">
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="relative text-center"
                  >
                    {/* Step circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`mx-auto h-32 w-32 rounded-full flex items-center justify-center mb-8 relative ${
                        index === 0 ? "bg-gradient-to-br from-primary to-emerald-500" :
                        index === 1 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                        "bg-gradient-to-br from-orange-500 to-red-500"
                      } shadow-2xl`}
                      style={{
                        boxShadow: index === 0 ? "0 20px 50px rgba(34, 197, 94, 0.4)" :
                                  index === 1 ? "0 20px 50px rgba(251, 191, 36, 0.4)" :
                                  "0 20px 50px rgba(249, 115, 22, 0.4)"
                      }}
                    >
                      {/* Inner glow */}
                      <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm" />
                      
                      {/* Step number */}
                      <span className="relative text-5xl font-bold text-white">{step.step}</span>
                      
                      {/* Rotating ring */}
                      <motion.div 
                        className="absolute inset-0 rounded-full border-2 border-dashed border-white/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                    
                    <h3 className="font-bold text-2xl mb-3 text-white">
                      {language === "en" ? step.title : step.titleHi}
                    </h3>
                    <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">
                      {language === "en" ? step.description : step.descriptionHi}
                    </p>
                  </motion.div>
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          </div>

          <AnimatedSection delay={0.6} className="text-center mt-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-2xl shadow-orange-500/30 px-10 h-14 text-lg rounded-full border-0"
              >
                <Link href="/scan-win">
                  {language === "en" ? "Start Winning Now" : "अभी जीतना शुरू करें"}
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Why Choose Us - Detailed */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1">
              <Award className="h-4 w-4 mr-2" />
              {language === "en" ? "Our Commitment" : "हमारी प्रतिबद्धता"}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {language === "en" ? "Why Choose" : "क्यों चुनें"}
              <span className="gradient-text"> Agrio India</span>
            </h2>
          </AnimatedSection>

          <AnimatedContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {whyChooseUs.map((item, index) => (
              <AnimatedItem key={index}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="text-center group"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-8">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 shadow-lg mb-6"
                      >
                        <item.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      <p className="text-4xl font-bold text-primary mb-1">{item.stat}</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {language === "en" ? item.statLabel : item.statLabelHi}
                      </p>
                      <h3 className="font-bold text-xl mb-3 text-gray-900">
                        {language === "en" ? item.title : item.titleHi}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {language === "en" ? item.description : item.descriptionHi}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="py-12 relative overflow-hidden bg-gradient-to-r from-primary to-emerald-600">
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Text */}
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {language === "en" ? "Need Help? Talk to Our Experts" : "मदद चाहिए? हमारे विशेषज्ञ से बात करें"}
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                {language === "en" 
                  ? "Get expert advice for your farming needs"
                  : "अपनी खेती की जरूरतों के लिए विशेषज्ञ सलाह लें"}
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="secondary" size="default" asChild className="text-primary shadow-lg">
                <a href="tel:+919520609999">
                  <Phone className="mr-2 h-4 w-4" />
                  {language === "en" ? "Call Now" : "कॉल करें"}
                </a>
              </Button>
              <Button size="default" asChild className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
                <a href="https://wa.me/919429693729" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

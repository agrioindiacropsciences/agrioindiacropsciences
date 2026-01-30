"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  QrCode,
  Gift,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Trophy,
  Zap,
  Shield,
  Smartphone,
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

const steps = [
  {
    icon: ShoppingBag,
    title: "Buy a Product",
    titleHi: "उत्पाद खरीदें",
    description: "Purchase any of our trusted Agrio India crop science products from a nearby store.",
    descriptionHi: "पास की दुकान से हमारे किसी भी विश्वसनीय एग्रियो इंडिया क्रॉप साइंस उत्पाद को खरीदें।",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: QrCode,
    title: "Scratch & Scan Code",
    titleHi: "खुरचें और कोड स्कैन करें",
    description: "Find the unique scratch code on the product packaging and easily scan it with your phone.",
    descriptionHi: "उत्पाद पैकेजिंग पर अद्वितीय स्क्रैच कोड खोजें और आसानी से अपने फोन से स्कैन करें।",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Gift,
    title: "Win Exciting Rewards",
    titleHi: "रोमांचक पुरस्कार जीतें",
    description: "Instantly win amazing rewards, from cashback to valuable farming tools.",
    descriptionHi: "तुरंत अद्भुत पुरस्कार जीतें, कैशबैक से लेकर मूल्यवान कृषि उपकरण तक।",
    color: "from-accent to-orange-500",
  },
];

const rewards = [
  { name: "Cashback ₹500", nameHi: "कैशबैक ₹500", icon: "💰" },
  { name: "10% Discount", nameHi: "10% छूट", icon: "🏷️" },
  { name: "Cashback ₹250", nameHi: "कैशबैक ₹250", icon: "💵" },
  { name: "Free Products", nameHi: "मुफ्त उत्पाद", icon: "🎁" },
  { name: "Gift Vouchers", nameHi: "गिफ्ट वाउचर", icon: "🎟️" },
  { name: "Farming Tools", nameHi: "कृषि उपकरण", icon: "🔧" },
];

const benefits = [
  { en: "100% Genuine rewards with every scan", hi: "हर स्कैन के साथ 100% असली पुरस्कार", icon: Shield },
  { en: "Instant prize revelation", hi: "तुरंत पुरस्कार का खुलासा", icon: Zap },
  { en: "Easy redemption process", hi: "आसान रिडेम्पशन प्रक्रिया", icon: CheckCircle },
  { en: "Digital certificate for every win", hi: "हर जीत के लिए डिजिटल प्रमाणपत्र", icon: Trophy },
  { en: "Track all your rewards in one place", hi: "एक जगह अपने सभी पुरस्कार ट्रैक करें", icon: Smartphone },
];

const stats = [
  { value: 2500000, suffix: "+", label: "Rewards Given", labelHi: "पुरस्कार दिए गए", prefix: "₹" },
  { value: 50000, suffix: "+", label: "Winners", labelHi: "विजेता" },
  { value: 100, suffix: "%", label: "Genuine", labelHi: "असली" },
];

export default function ScanWinPage() {
  const { language, isAuthenticated } = useStore();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/landscape-green-field.jpg"
            alt="Beautiful green agricultural landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-emerald-600/80" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <Badge className="bg-accent text-white border-0 mb-6 px-5 py-2 shadow-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                {language === "en" ? "Win Exciting Rewards" : "रोमांचक पुरस्कार जीतें"}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {language === "en" ? (
                  <>Grow Your Crops,<br /><span className="text-accent">Grow Your Rewards</span></>
                ) : (
                  <>अपनी फसल बढ़ाएं,<br /><span className="text-accent">अपने पुरस्कार बढ़ाएं</span></>
                )}
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-lg leading-relaxed">
                {language === "en"
                  ? "Purchase authentic Agrio India products, scan the code, and win exciting rewards. Join thousands of farmers benefiting from our program."
                  : "प्रामाणिक एग्रियो इंडिया उत्पाद खरीदें, कोड स्कैन करें और रोमांचक पुरस्कार जीतें। हमारे कार्यक्रम से लाभान्वित हजारों किसानों से जुड़ें।"}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-8 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-bold text-accent">
                      {stat.prefix}<CountUp end={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm opacity-80">
                      {language === "en" ? stat.label : stat.labelHi}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white h-14 px-8 text-lg shadow-xl shadow-accent/30"
                >
                  <Link href={isAuthenticated ? "/dashboard/scan" : "/auth"}>
                    {isAuthenticated
                      ? language === "en"
                        ? "Scan Code Now"
                        : "अभी कोड स्कैन करें"
                      : language === "en"
                      ? "Login to Scan Code"
                      : "स्कैन कोड के लिए लॉगिन"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                {/* Animated QR Code Display */}
                <motion.div
                  className="relative w-80 h-80"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Outer glow ring */}
                  <motion.div 
                    className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-accent via-orange-400 to-amber-400"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  {/* Inner container */}
                  <div className="absolute inset-3 rounded-[2.5rem] bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <QrCode className="h-32 w-32 text-primary" />
                    </motion.div>
                  </div>

                  {/* Scanning line */}
                  <motion.div
                    className="absolute left-8 right-8 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full"
                    animate={{ top: ["20%", "80%", "20%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>

                {/* Floating reward badges */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">₹500</p>
                      <p className="text-xs text-gray-500">Cashback</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold gradient-text-gold">₹25L+</p>
                      <p className="text-xs text-gray-500">Total Rewards</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -right-16 bg-white rounded-xl shadow-xl px-4 py-2"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <span className="text-sm font-semibold">50K+ Winners</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Compact */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-8">
            <Badge className="bg-accent/20 text-accent border-accent/30 mb-3">
              <Sparkles className="h-3 w-3 mr-1" />
              {language === "en" ? "Scan & Win" : "स्कैन और जीतें"}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {language === "en" ? "Simple Steps to Your " : "आपके पुरस्कारों के लिए "}
              <span className="text-accent">{language === "en" ? "Rewards" : "सरल कदम"}</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">
              {language === "en"
                ? "Follow these three easy steps to start winning. It's simple, quick, and rewarding."
                : "जीतना शुरू करने के लिए इन तीन आसान चरणों का पालन करें।"}
            </p>
          </AnimatedSection>

          <div className="relative max-w-4xl mx-auto">
            {/* Connection line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500 via-orange-500 to-red-500 z-0" />
            
            <AnimatedContainer className="grid md:grid-cols-3 gap-6 relative z-10" staggerDelay={0.1}>
              {steps.map((step, index) => (
                <AnimatedItem key={index} direction="scale">
                  <div className="text-center">
                    {/* Step number circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`inline-flex items-center justify-center h-20 w-20 rounded-full mb-4 shadow-lg ${
                        index === 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                        index === 1 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                        "bg-gradient-to-br from-red-400 to-red-600"
                      }`}
                    >
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </motion.div>
                    
                    <h3 className="font-bold text-lg text-white mb-2">
                      {language === "en" ? step.title : step.titleHi}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-[200px] mx-auto">
                      {language === "en" ? step.description : step.descriptionHi}
                    </p>
                  </div>
                </AnimatedItem>
              ))}
            </AnimatedContainer>

            {/* CTA Button */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Button
                asChild
                className="bg-accent hover:bg-accent/90 text-white px-8 shadow-lg shadow-accent/30"
              >
                <Link href={isAuthenticated ? "/dashboard/scan" : "/auth"}>
                  {language === "en" ? "Start Winning Now" : "अभी जीतना शुरू करें"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
              <Star className="h-4 w-4 mr-2" />
              {language === "en" ? "Win Big" : "बड़ा जीतें"}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {language === "en" ? "Exciting Rewards Await" : "रोमांचक पुरस्कार आपका इंतजार कर रहे हैं"}
            </h2>
            <p className="text-gray-600 text-lg">
              {language === "en"
                ? "Win from a variety of amazing prizes with every scan"
                : "हर स्कैन के साथ विभिन्न अद्भुत पुरस्कार जीतें"}
            </p>
          </AnimatedSection>

          <AnimatedContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" staggerDelay={0.1}>
            {rewards.map((reward, index) => (
              <AnimatedItem key={index} direction="scale">
                <motion.div
                  whileHover={{ y: -10, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        className="text-5xl mb-4"
                      >
                        {reward.icon}
                      </motion.div>
                      <p className="font-semibold text-sm">
                        {language === "en" ? reward.name : reward.nameHi}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <Badge variant="outline" className="mb-4">
                {language === "en" ? "Why Join" : "क्यों शामिल हों"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
                {language === "en" ? "Why Join Our Rewards Program?" : "हमारे रिवार्ड्स प्रोग्राम में क्यों शामिल हों?"}
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-medium">
                      {language === "en" ? benefit.en : benefit.hi}
                    </span>
                  </motion.div>
                ))}
              </div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="mt-8"
              >
                <Button asChild size="lg" className="h-14 px-8 shadow-xl shadow-primary/20">
                  <Link href={isAuthenticated ? "/dashboard/scan" : "/auth"}>
                    {language === "en" ? "Start Winning Now" : "अभी जीतना शुरू करें"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative h-[500px] flex items-center justify-center">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-500/10 to-accent/10 rounded-3xl" />
                
                {/* Animated circles */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-[400px] h-[400px] rounded-full border-2 border-dashed border-primary/20" />
                </motion.div>
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-[300px] h-[300px] rounded-full border-2 border-dashed border-accent/20" />
                </motion.div>

                {/* Center content */}
                <motion.div 
                  className="relative z-10 text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-32 w-32 mx-auto rounded-full bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center shadow-2xl shadow-accent/30 mb-6"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="h-16 w-16 text-white" />
                  </motion.div>
                  <p className="text-5xl font-bold gradient-text-gold mb-2">50,000+</p>
                  <p className="text-xl text-gray-600 font-semibold">
                    {language === "en" ? "Winners Already!" : "विजेता पहले से ही!"}
                  </p>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  className="absolute top-10 left-10 h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-3xl">🎁</span>
                </motion.div>
                <motion.div
                  className="absolute top-20 right-10 h-14 w-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                >
                  <span className="text-2xl">💰</span>
                </motion.div>
                <motion.div
                  className="absolute bottom-20 left-16 h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                  <span className="text-xl">⭐</span>
                </motion.div>
                <motion.div
                  className="absolute bottom-10 right-20 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-xl"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <span className="text-2xl">🏆</span>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-12 bg-gradient-to-r from-primary to-emerald-600">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {language === "en" ? "Ready to Win?" : "जीतने के लिए तैयार?"}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {language === "en"
                  ? "Start scanning your product codes today"
                  : "आज ही अपने उत्पाद कोड स्कैन करना शुरू करें"}
              </p>
            </div>
            
            <Button
              asChild
              size="default"
              variant="secondary"
              className="text-primary shadow-lg"
            >
              <Link href={isAuthenticated ? "/dashboard/scan" : "/auth"}>
                <QrCode className="mr-2 h-4 w-4" />
                {language === "en" ? "Scan Code" : "कोड स्कैन करें"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

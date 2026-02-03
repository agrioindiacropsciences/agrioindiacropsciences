"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Package, ArrowRight, Star, ChevronRight, Trophy, Leaf, Beaker, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import {
  AnimatedSection,
  AnimatedContainer,
  AnimatedItem,
  FloatingElement,
  CountUp,
} from "@/components/ui/animated-section";

// Best Selling Products Data
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
    image: "/product2.jpeg",
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
    image: "/product3.PNG",
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
  {
    id: "5",
    name: "Agrio Topis",
    nameHi: "एग्रियो टॉपिस",
    technical: "Topramezone 33.6% SC",
    technicalHi: "टोप्रामेज़ोन 33.6% SC",
    dosage: "30ml/Acre",
    dosageHi: "30ml/एकड़",
    price: 1200,
    packSize: "30ml",
    image: "/product5.PNG",
    category: "Herbicide",
    categoryHi: "खरपतवारनाशक",
    gradient: "from-amber-500 to-yellow-500",
    bgGradient: "from-amber-50 to-yellow-50",
  },
  {
    id: "6",
    name: "Agrio Unicorn",
    nameHi: "एग्रियो यूनिकॉर्न",
    technical: "Sodium Para-Nitro Phenolate 0.3% SL",
    technicalHi: "सोडियम पैरा-नाइट्रो फेनोलेट 0.3% SL",
    dosage: "250ml/Acre",
    dosageHi: "250ml/एकड़",
    price: 500,
    packSize: "250ml",
    image: "/product6.PNG",
    category: "Plant Growth Regulator",
    categoryHi: "पौधा वृद्धि नियामक",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50 to-cyan-50",
  },
];

export default function BestSellingPage() {
  const { language } = useStore();

  return (
    <div className="min-h-screen overflow-hidden pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[45vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/green-field-with-clouds.jpg"
            alt="Beautiful green field with clouds"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-emerald-600/80" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </div>

        {/* Floating decorations */}
        <FloatingElement className="absolute top-20 right-20 opacity-20 hidden lg:block" duration={5}>
          <Trophy className="h-24 w-24 text-accent" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-20 left-20 opacity-20 hidden lg:block" duration={6} delay={2}>
          <Star className="h-20 w-20 text-white" />
        </FloatingElement>

        <div className="container mx-auto px-4 lg:px-8 relative py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <Badge className="bg-accent text-white border-0 mb-6 px-5 py-2 shadow-lg">
              <Star className="h-4 w-4 mr-2 fill-current" />
              {language === "en" ? "Farmer's Choice" : "किसानों की पसंद"}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {language === "en" ? "Best Selling Products" : "बेस्ट सेलिंग उत्पाद"}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              {language === "en"
                ? "Trusted solutions for a bountiful harvest, chosen by farmers across India."
                : "भारत भर के किसानों द्वारा चुने गए, भरपूर फसल के लिए विश्वसनीय समाधान।"}
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 md:gap-12 mt-10"
            >
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  <CountUp end={200000} suffix="+" />
                </p>
                <p className="text-sm text-white/80">{language === "en" ? "Farmers Trust Us" : "किसानों का विश्वास"}</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                <p className="text-3xl md:text-4xl font-bold text-white">
                  <CountUp end={50} suffix="+" />
                </p>
                <p className="text-sm text-white/80">{language === "en" ? "Products" : "उत्पाद"}</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
                <p className="text-3xl md:text-4xl font-bold text-white">100%</p>
                <p className="text-sm text-white/80">{language === "en" ? "Quality Tested" : "गुणवत्ता परीक्षित"}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V80Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" staggerDelay={0.1}>
            {bestSellingProducts.map((product, index) => (
              <AnimatedItem key={product.id}>
                  <Card className="group overflow-hidden h-full border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white">
                    {/* Gradient Top Border */}
                    <div className={`h-1.5 bg-gradient-to-r ${product.gradient}`} />
                    
                    {/* Product Image Section - Box size matches image aspect ratio */}
                    <div className="relative w-full aspect-[3/4] bg-white overflow-hidden border border-gray-100">
                      <Image
                        src={product.image}
                        alt={language === "en" ? product.name : product.nameHi}
                        fill
                        className="object-contain p-6"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Rank Badge */}
                      <div
                        className={`absolute top-4 left-4 h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg bg-gradient-to-br ${
                          index === 0 ? "from-yellow-400 to-amber-500" :
                          index === 1 ? "from-gray-300 to-gray-500" :
                          index === 2 ? "from-amber-600 to-amber-700" :
                          product.gradient
                        }`}
                      >
                        <span className="text-lg">#{index + 1}</span>
                      </div>
                      
                      {/* Best Seller Badge */}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/95 text-gray-900 border-0 shadow-lg px-3 py-1.5">
                          <Star className="h-3.5 w-3.5 mr-1.5 text-amber-500 fill-amber-500" />
                          {language === "en" ? "Best Seller" : "बेस्ट सेलर"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Category */}
                      <Badge className={`mb-3 bg-gradient-to-r ${product.gradient} text-white border-0`}>
                        {language === "en" ? product.category : product.categoryHi}
                      </Badge>

                      {/* Product Name */}
                      <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-primary transition-colors">
                        {language === "en" ? product.name : product.nameHi}
                      </h3>

                      {/* Technical Composition */}
                      <div className="flex items-start gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shrink-0`}>
                          <Beaker className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                            {language === "en" ? "Composition" : "संरचना"}
                          </p>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                            {language === "en" ? product.technical : product.technicalHi}
                          </p>
                        </div>
                      </div>

                      {/* Dosage if available */}
                      {product.dosage && (
                        <div className="flex items-center gap-2 mb-4 text-sm">
                          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-gray-600">
                            {language === "en" ? "Dosage: " : "खुराक: "}
                            <span className="font-semibold text-gray-900">
                              {language === "en" ? product.dosage : product.dosageHi}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Price & CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className={`text-3xl font-bold bg-gradient-to-r ${product.gradient} bg-clip-text text-transparent`}>
                            ₹{product.price}
                          </p>
                          {product.packSize && (
                            <p className="text-xs text-gray-500">per {product.packSize}</p>
                          )}
                        </div>
                        <Button asChild className={`shadow-lg bg-gradient-to-r ${product.gradient} hover:opacity-90 border-0`}>
                          <Link href="/contact">
                            {language === "en" ? "Enquire" : "पूछताछ"}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      </CardContent>
                  </Card>
              </AnimatedItem>
            ))}
          </AnimatedContainer>

          {/* View All Products CTA */}
          <AnimatedSection delay={0.5} className="text-center mt-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2 hover:bg-primary hover:text-white transition-all">
                <Link href="/products">
                  {language === "en" ? "View All Products" : "सभी उत्पाद देखें"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

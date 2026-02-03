"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Package,
  X,
  Star,
  ChevronRight,
  Beaker,
  Leaf,
  Sparkles,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store/useStore";

// Best Selling Products Data
const allProducts = [
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
    image: "/product5.JPG",
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
    image: "/product6.JPG",
    category: "Plant Growth Regulator",
    categoryHi: "पौधा वृद्धि नियामक",
    gradient: "from-teal-500 to-cyan-500",
    bgGradient: "from-teal-50 to-cyan-50",
  },
];

// Get unique categories with colors
const categoryData = [
  { id: "All", name: "All", nameHi: "सभी", color: "from-gray-500 to-gray-600" },
  { id: "Insecticide", name: "Insecticide", nameHi: "कीटनाशक", color: "from-red-500 to-orange-500" },
  { id: "Fungicide", name: "Fungicide", nameHi: "फफूंदनाशक", color: "from-blue-500 to-cyan-500" },
  { id: "Herbicide", name: "Herbicide", nameHi: "खरपतवारनाशक", color: "from-purple-500 to-pink-500" },
  { id: "Plant Growth Regulator", name: "Plant Growth Regulator", nameHi: "पौधा वृद्धि नियामक", color: "from-green-500 to-emerald-500" },
];

export default function ProductsPage() {
  const { language } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nameHi.includes(query) ||
          p.technical.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "priceLow":
          return a.price - b.price;
        case "priceHigh":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("name");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All";

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-600" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          />
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 py-12 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">{language === "en" ? "Premium Quality Products" : "प्रीमियम गुणवत्ता उत्पाद"}</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {language === "en" ? "Our Products" : "हमारे उत्पाद"}
              </h1>
              <p className="text-white/80 max-w-xl text-lg">
                {language === "en"
                  ? "High-quality agrochemical solutions designed for the modern Indian farmer."
                  : "आधुनिक भारतीय किसान के लिए डिज़ाइन किए गए उच्च गुणवत्ता वाले कृषि रसायन।"}
              </p>
            </motion.div>

          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V80Z" fill="#f9fafb"/>
          </svg>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">{language === "en" ? "Filter by Category" : "श्रेणी के अनुसार फ़िल्टर करें"}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categoryData.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? "text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }`}
              >
                {selectedCategory === cat.id && (
                  <motion.div
                    layoutId="categoryBg"
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${cat.color}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  {language === "en" ? cat.name : cat.nameHi}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder={language === "en" ? "Search products by name or composition..." : "नाम या संरचना से उत्पाद खोजें..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-0 shadow-lg bg-white focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-56 h-14 rounded-2xl border-0 shadow-lg bg-white">
              <SelectValue placeholder={language === "en" ? "Sort by" : "क्रमबद्ध करें"} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="name">{language === "en" ? "Name (A-Z)" : "नाम (A-Z)"}</SelectItem>
              <SelectItem value="nameDesc">{language === "en" ? "Name (Z-A)" : "नाम (Z-A)"}</SelectItem>
              <SelectItem value="priceLow">{language === "en" ? "Price: Low to High" : "कीमत: कम से ज्यादा"}</SelectItem>
              <SelectItem value="priceHigh">{language === "en" ? "Price: High to Low" : "कीमत: ज्यादा से कम"}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {language === "en" 
                  ? `${filteredProducts.length} Products Found`
                  : `${filteredProducts.length} उत्पाद मिले`}
              </p>
              <p className="text-sm text-gray-500">
                {selectedCategory === "All" 
                  ? (language === "en" ? "Showing all categories" : "सभी श्रेणियां दिखा रहे हैं")
                  : (language === "en" ? `Category: ${selectedCategory}` : `श्रेणी: ${selectedCategory}`)}
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              {language === "en" ? "Clear" : "साफ़ करें"}
            </Button>
          )}
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
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
                        <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
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
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20"
            >
              <Card className="max-w-md mx-auto p-12 text-center border-0 shadow-xl">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-6"
                >
                  <Package className="h-12 w-12 text-gray-400" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {language === "en" ? "No products found" : "कोई उत्पाद नहीं मिला"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {language === "en"
                    ? "Try adjusting your search or filters"
                    : "अपनी खोज या फ़िल्टर को समायोजित करने का प्रयास करें"}
                </p>
                <Button onClick={clearFilters} className="shadow-lg">
                  <X className="h-4 w-4 mr-2" />
                  {language === "en" ? "Clear All Filters" : "सभी फ़िल्टर साफ़ करें"}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="relative bg-gradient-to-r from-primary via-emerald-500 to-teal-500 p-8 md:p-12">
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
              </div>

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-white text-center md:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    {language === "en" ? "Need Help Choosing?" : "चुनने में मदद चाहिए?"}
                  </h3>
                  <p className="text-white/80">
                    {language === "en" 
                      ? "Our experts are here to help you find the right product for your crops."
                      : "हमारे विशेषज्ञ आपकी फसलों के लिए सही उत्पाद खोजने में मदद करने के लिए यहाँ हैं।"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
                    <Link href="/contact">
                      {language === "en" ? "Contact Us" : "संपर्क करें"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

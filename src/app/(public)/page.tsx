"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  MapPin,
  Leaf,
  Languages,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Package,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import type { Product } from "@/lib/api";

const features = [
  {
    icon: QrCode,
    title: "Scan & Win Rewards",
    titleHi: "स्कैन करें और पुरस्कार जीतें",
    description: "Scan product QR codes to earn exciting rewards directly.",
    descriptionHi: "उत्पाद QR कोड स्कैन करके सीधे रोमांचक पुरस्कार अर्जित करें।",
  },
  {
    icon: MapPin,
    title: "Nearby Distributors",
    titleHi: "नजदीकी वितरक",
    description: "Easily locate our trusted distributors in your area.",
    descriptionHi: "अपने क्षेत्र में हमारे विश्वसनीय वितरकों को आसानी से खोजें।",
  },
  {
    icon: Leaf,
    title: "Farmer-Friendly Products",
    titleHi: "किसान अनुकूल उत्पाद",
    description: "High-quality products designed for the modern Indian farmer.",
    descriptionHi: "आधुनिक भारतीय किसान के लिए डिज़ाइन किए गए उच्च गुणवत्ता वाले उत्पाद।",
  },
  {
    icon: Languages,
    title: "Hindi Support",
    titleHi: "हिंदी सहायता",
    description: "Access all information and support in Hindi.",
    descriptionHi: "हिंदी में सभी जानकारी और सहायता प्राप्त करें।",
  },
];

const whyChooseUs = [
  {
    icon: CheckCircle2,
    title: "Assured Quality",
    titleHi: "गुणवत्ता की गारंटी",
    description: "Our products undergo rigorous testing to ensure the highest quality standards.",
    descriptionHi: "हमारे उत्पाद उच्चतम गुणवत्ता मानकों को सुनिश्चित करने के लिए कठोर परीक्षण से गुजरते हैं।",
  },
  {
    icon: TrendingUp,
    title: "Better Crop Yield",
    titleHi: "बेहतर फसल उपज",
    description: "Formulated to boost crop health and maximize your agricultural output.",
    descriptionHi: "फसल स्वास्थ्य को बढ़ावा देने और कृषि उत्पादन को अधिकतम करने के लिए तैयार।",
  },
  {
    icon: Users,
    title: "Trusted By Farmers",
    titleHi: "किसानों का विश्वास",
    description: "Millions of farmers across India trust us for their crop care needs.",
    descriptionHi: "भारत भर में लाखों किसान अपनी फसल देखभाल की जरूरतों के लिए हम पर भरोसा करते हैं।",
  },
  {
    icon: Package,
    title: "Wide Range of Products",
    titleHi: "उत्पादों की विस्तृत श्रृंखला",
    description: "A comprehensive portfolio of agrochemicals for various crops and needs.",
    descriptionHi: "विभिन्न फसलों और जरूरतों के लिए कृषि रसायनों का व्यापक पोर्टफोलियो।",
  },
];

const steps = [
  {
    step: 1,
    title: "Buy a Product",
    titleHi: "उत्पाद खरीदें",
    description: "Purchase any of our trusted Agrio India crop science products from a nearby store.",
    descriptionHi: "पास की दुकान से हमारे किसी भी विश्वसनीय एग्रियो इंडिया क्रॉप साइंस उत्पाद को खरीदें।",
  },
  {
    step: 2,
    title: "Scratch & Scan Code",
    titleHi: "खुरचें और कोड स्कैन करें",
    description: "Find the unique scratch code on the product packaging and easily scan it with your phone.",
    descriptionHi: "उत्पाद पैकेजिंग पर अद्वितीय स्क्रैच कोड खोजें और आसानी से अपने फोन से स्कैन करें।",
  },
  {
    step: 3,
    title: "Win Exciting Rewards",
    titleHi: "रोमांचक पुरस्कार जीतें",
    description: "Instantly win amazing rewards, from cashback to valuable farming tools.",
    descriptionHi: "तुरंत अद्भुत पुरस्कार जीतें, कैशबैक से लेकर मूल्यवान कृषि उपकरण तक।",
  },
];

// Product card skeleton
function ProductSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-5">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-3/4 mb-1" />
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { language } = useStore();
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch best selling products on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await api.getBestSellers(4);
        if (productsRes.success && productsRes.data) {
          setBestSellingProducts(productsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/green-field-with-clouds.jpg"
            alt="Beautiful green agricultural field"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-1.5 text-sm">
                {language === "en" ? "Premium Agrochemicals" : "प्रीमियम कृषि रसायन"}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-normal">
                <span className="text-primary italic block">Agrio Sampan</span>
                <span className="text-primary italic block">Kisan</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 font-hindi mt-2">
                भारतीय किसान की पहली पसंद
              </p>
              <p className="text-lg text-gray-600 max-w-lg">
                {language === "en"
                  ? "Premium Agrochemicals for Higher Yield. Empowering Indian farmers with high-quality crop solutions."
                  : "उच्च उपज के लिए प्रीमियम कृषि रसायन। उच्च गुणवत्ता वाले फसल समाधानों के साथ भारतीय किसानों को सशक्त बनाना।"}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="text-base px-8">
                  <Link href="/products">
                    {language === "en" ? "View Products" : "उत्पाद देखें"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8">
                  <Link href="/auth">
                    {language === "en" ? "Login for Scan & Win" : "स्कैन और जीतें के लिए लॉगिन"}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/man-gardener-growing-green-spring-onion.jpg"
                  alt="Indian farmer working in the field"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xl font-medium">
                    {language === "en" ? "Growing Together" : "साथ मिलकर बढ़ना"}
                  </p>
                </div>
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-8 -left-8 bg-white rounded-xl shadow-xl p-6 border animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">2L+</p>
                    <p className="text-sm text-gray-600">
                      {language === "en" ? "Happy Farmers" : "खुश किसान"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <Card className="h-full hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto h-14 w-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                      <feature.icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {language === "en" ? feature.title : feature.titleHi}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === "en" ? feature.description : feature.descriptionHi}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "en" ? "Best Selling Products" : "बेस्ट सेलिंग उत्पाद"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "en"
                ? "Trusted solutions for a bountiful harvest, chosen by farmers across India."
                : "भारत भर के किसानों द्वारा चुने गए, भरपूर फसल के लिए विश्वसनीय समाधान।"}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : bestSellingProducts.length > 0 ? (
              bestSellingProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-green-50">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={language === "en" ? product.name : product.name_hi}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    {product.is_best_seller && (
                      <Badge className="absolute top-3 left-3 bg-accent text-white">
                        {language === "en" ? "Best Seller" : "बेस्ट सेलर"}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="outline" className="mb-2 text-xs capitalize">
                      {product.category?.name || "Product"}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-1">
                      {language === "en" ? product.name : product.name_hi}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {language === "en" ? product.description : product.description_hi}
                    </p>
                    <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                      <Link href={`/products/${product.slug}`}>
                        {language === "en" ? "Know More" : "और जानें"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                {language === "en" ? "No products available" : "कोई उत्पाद उपलब्ध नहीं है"}
              </div>
            )}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link href="/products">
                {language === "en" ? "View All Products" : "सभी उत्पाद देखें"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "en" ? "Simple Steps to Your Rewards" : "आपके पुरस्कारों के लिए सरल कदम"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === "en"
                ? "Follow these three easy steps to start winning. It's simple, quick, and rewarding."
                : "जीतना शुरू करने के लिए इन तीन आसान चरणों का पालन करें। यह सरल, त्वरित और फायदेमंद है।"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className={`h-full ${index === 2 ? "bg-accent text-white" : ""}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                      index === 2 ? "bg-white/20" : "bg-secondary"
                    }`}>
                      <span className={`text-2xl font-bold ${index === 2 ? "text-white" : "text-primary"}`}>
                        {step.step}
                      </span>
                    </div>
                    <h3 className="font-semibold text-xl mb-3">
                      {language === "en" ? step.title : step.titleHi}
                    </h3>
                    <p className={`text-sm ${index === 2 ? "text-white/90" : "text-gray-600"}`}>
                      {language === "en" ? step.description : step.descriptionHi}
                    </p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/green-rice-fields.jpg"
            alt="Lush green rice fields"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "en" ? "Why Choose Agrio India" : "एग्रियो इंडिया क्यों चुनें"}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-md mb-4">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {language === "en" ? item.title : item.titleHi}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === "en" ? item.description : item.descriptionHi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/road-middle-sugar-cane-field-sunny-day-with-mountain-back.jpg"
            alt="Road through sugar cane fields"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-2">
                {language === "en" ? "Need Help? Talk to our expert." : "मदद चाहिए? हमारे विशेषज्ञ से बात करें।"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="lg" asChild className="text-primary">
                <a href="tel:+919520609999">
                  <Phone className="mr-2 h-5 w-5" />
                  {language === "en" ? "Call Now" : "अभी कॉल करें"}
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-white border-white hover:bg-white hover:text-primary">
                <a href="https://wa.me/919429693729" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

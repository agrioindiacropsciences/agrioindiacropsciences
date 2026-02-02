"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Heart,
  Award,
  Leaf,
  TrendingUp,
  Shield,
  Users,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/store/useStore";
import {
  AnimatedSection,
  AnimatedContainer,
  AnimatedItem,
  CountUp,
  FloatingElement,
} from "@/components/ui/animated-section";

const values = [
  {
    icon: Shield,
    title: "Quality",
    titleHi: "गुणवत्ता",
    description: "We are committed to providing the highest quality products that meet international standards.",
    descriptionHi: "हम अंतरराष्ट्रीय मानकों को पूरा करने वाले उच्चतम गुणवत्ता वाले उत्पाद प्रदान करने के लिए प्रतिबद्ध हैं।",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "Trust",
    titleHi: "विश्वास",
    description: "Building lasting relationships with farmers based on trust and reliability.",
    descriptionHi: "विश्वास और विश्वसनीयता के आधार पर किसानों के साथ स्थायी संबंध बनाना।",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    titleHi: "स्थिरता",
    description: "Developing eco-friendly solutions that protect both crops and the environment.",
    descriptionHi: "पर्यावरण के अनुकूल समाधान विकसित करना जो फसलों और पर्यावरण दोनों की रक्षा करें।",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: TrendingUp,
    title: "Innovation",
    titleHi: "नवाचार",
    description: "Continuously researching and developing new solutions for modern farming challenges.",
    descriptionHi: "आधुनिक कृषि चुनौतियों के लिए लगातार नए समाधानों का अनुसंधान और विकास करना।",
    color: "from-purple-500 to-violet-500",
  },
];

const stats = [
  { value: 25, suffix: "+", label: "Years of Experience", labelHi: "वर्षों का अनुभव", icon: Award },
  { value: 200000, suffix: "+", label: "Happy Farmers", labelHi: "खुश किसान", icon: Users },
  { value: 100, suffix: "+", label: "Products", labelHi: "उत्पाद", icon: Leaf },
  { value: 500, suffix: "+", label: "Distributors", labelHi: "वितरक", icon: MapPin },
];

const milestones = [
  { year: "1998", title: "Founded", titleHi: "स्थापित", description: "Started our journey in Uttar Pradesh", descriptionHi: "उत्तर प्रदेश में हमारी यात्रा शुरू हुई" },
  { year: "2005", title: "Expansion", titleHi: "विस्तार", description: "Expanded to 5 states across North India", descriptionHi: "उत्तर भारत के 5 राज्यों में विस्तार" },
  { year: "2012", title: "ISO Certified", titleHi: "ISO प्रमाणित", description: "Achieved ISO 9001:2015 certification", descriptionHi: "ISO 9001:2015 प्रमाणन प्राप्त किया" },
  { year: "2020", title: "Digital Era", titleHi: "डिजिटल युग", description: "Launched digital platform for farmers", descriptionHi: "किसानों के लिए डिजिटल प्लेटफॉर्म लॉन्च किया" },
  { year: "2024", title: "2L+ Farmers", titleHi: "2L+ किसान", description: "Serving over 2 lakh farmers nationwide", descriptionHi: "देशभर में 2 लाख से अधिक किसानों की सेवा" },
];

export default function AboutPage() {
  const { language } = useStore();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/landscape-green-field.jpg"
            alt="Beautiful green agricultural landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        </div>

        {/* Floating decorations */}
        <FloatingElement className="absolute top-20 right-20 opacity-20" duration={5}>
          <Leaf className="h-32 w-32 text-white" />
        </FloatingElement>
        <FloatingElement className="absolute bottom-20 left-20 opacity-20" duration={6} delay={2}>
          <Leaf className="h-24 w-24 text-white rotate-45" />
        </FloatingElement>

        <div className="container mx-auto px-4 lg:px-8 relative py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-2">
              {language === "en" ? "Since 1998" : "1998 से"}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {language === "en" ? "About Agrio India" : "एग्रियो इंडिया के बारे में"}
            </h1>
            <p className="text-xl md:text-2xl opacity-90 leading-relaxed">
              {language === "en"
                ? "Agrio Sampan Kisan - Empowering Indian farmers with high-quality crop solutions for over 25 years."
                : "एग्रियो संपन किसान - 25 से अधिक वर्षों से उच्च गुणवत्ता वाले फसल समाधानों के साथ भारतीय किसानों को सशक्त बनाना।"}
            </p>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="left">
              <Badge variant="outline" className="mb-4">
                {language === "en" ? "Our Journey" : "हमारी यात्रा"}
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {language === "en" ? "Our Story" : "हमारी कहानी"}
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  {language === "en"
                    ? "Agrio India Crop Science was founded with a simple yet powerful mission: to empower Indian farmers with the best agrochemical solutions that ensure bountiful harvests and sustainable farming practices."
                    : "एग्रियो इंडिया क्रॉप साइंस की स्थापना एक सरल लेकिन शक्तिशाली मिशन के साथ की गई थी: भारतीय किसानों को सर्वोत्तम कृषि रसायन समाधान प्रदान करना जो भरपूर फसल और टिकाऊ कृषि प्रथाओं को सुनिश्चित करें।"}
                </p>
                <p>
                  {language === "en"
                    ? "Starting from a small manufacturing unit in Uttar Pradesh, we have grown to become one of the most trusted names in Indian agriculture. Our commitment to quality, innovation, and farmer welfare has remained unchanged throughout our journey."
                    : "उत्तर प्रदेश में एक छोटी विनिर्माण इकाई से शुरू होकर, हम भारतीय कृषि में सबसे विश्वसनीय नामों में से एक बन गए हैं। गुणवत्ता, नवाचार और किसान कल्याण के प्रति हमारी प्रतिबद्धता पूरी यात्रा में अपरिवर्तित रही है।"}
                </p>
                <p>
                  {language === "en"
                    ? "Today, our products are used by over 2 lakh farmers across India, helping them achieve better yields and improved livelihoods."
                    : "आज, हमारे उत्पाद भारत भर में 2 लाख से अधिक किसानों द्वारा उपयोग किए जाते हैं, जिससे उन्हें बेहतर उपज और बेहतर आजीविका प्राप्त करने में मदद मिलती है।"}
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
                >
                  <Image
                    src="/man-gardener-growing-green-spring-onion.jpg"
                    alt="Indian farmer working in the field"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>
                
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold gradient-text">25+</p>
                      <p className="text-gray-600">{language === "en" ? "Years" : "वर्ष"}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/road-middle-sugar-cane-field-sunny-day-with-mountain-back.jpg"
            alt="Agricultural landscape"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-emerald-600/95" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <AnimatedContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.15}>
            {stats.map((stat, index) => (
              <AnimatedItem key={index} direction="scale">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center text-white p-8 rounded-2xl bg-white/10 backdrop-blur"
                >
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 mb-4">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-4xl md:text-5xl font-bold mb-2">
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

      {/* Timeline / Milestones */}
      <section className="py-24 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {language === "en" ? "Our Milestones" : "हमारी उपलब्धियां"}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              {language === "en" ? "Journey Through Time" : "समय की यात्रा"}
            </h2>
          </AnimatedSection>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary -translate-x-1/2" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <AnimatedSection
                  key={index}
                  direction={index % 2 === 0 ? "left" : "right"}
                  delay={index * 0.1}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border"
                    >
                      <p className="text-primary font-bold text-2xl mb-2">{milestone.year}</p>
                      <h3 className="text-xl font-bold mb-2">
                        {language === "en" ? milestone.title : milestone.titleHi}
                      </h3>
                      <p className="text-gray-600">
                        {language === "en" ? milestone.description : milestone.descriptionHi}
                      </p>
                    </motion.div>
                  </div>
                  
                  {/* Center dot */}
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="h-6 w-6 rounded-full bg-primary border-4 border-white shadow-lg"
                    />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedContainer className="grid md:grid-cols-2 gap-8" staggerDelay={0.2}>
            {/* Mission */}
            <AnimatedItem>
              <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Card className="h-full border-0 shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-emerald-500" />
                  <CardContent className="p-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mb-8 shadow-xl"
                    >
                      <Target className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-6">
                      {language === "en" ? "Our Mission" : "हमारा मिशन"}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {language === "en"
                        ? "To provide Indian farmers with innovative, high-quality, and affordable agrochemical solutions that maximize crop yields while promoting sustainable agricultural practices."
                        : "भारतीय किसानों को नवीन, उच्च गुणवत्ता वाले और किफायती कृषि रसायन समाधान प्रदान करना जो टिकाऊ कृषि प्रथाओं को बढ़ावा देते हुए फसल की पैदावार को अधिकतम करें।"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedItem>

            {/* Vision */}
            <AnimatedItem>
              <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Card className="h-full border-0 shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-accent to-orange-500" />
                  <CardContent className="p-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center mb-8 shadow-xl"
                    >
                      <Eye className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-6">
                      {language === "en" ? "Our Vision" : "हमारी दृष्टि"}
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {language === "en"
                        ? "To be the most trusted partner for Indian farmers, driving agricultural prosperity across the nation through cutting-edge crop science solutions and unwavering commitment to farmer welfare."
                        : "भारतीय किसानों के लिए सबसे विश्वसनीय भागीदार बनना, अत्याधुनिक फसल विज्ञान समाधानों और किसान कल्याण के प्रति अटूट प्रतिबद्धता के माध्यम से पूरे देश में कृषि समृद्धि को आगे बढ़ाना।"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gradient-section">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {language === "en" ? "What We Stand For" : "हम किसके लिए खड़े हैं"}
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {language === "en" ? "Our Core Values" : "हमारे मूल मूल्य"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {language === "en"
                ? "The principles that guide everything we do at Agrio India."
                : "एग्रियो इंडिया में हमारे हर काम का मार्गदर्शन करने वाले सिद्धांत।"}
            </p>
          </AnimatedSection>

          <AnimatedContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
            {values.map((value, index) => (
              <AnimatedItem key={index}>
                <motion.div
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full text-center border-0 shadow-xl overflow-hidden group">
                    <CardContent className="p-8">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 shadow-lg`}
                      >
                        <value.icon className="h-10 w-10 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-2xl mb-4">
                        {language === "en" ? value.title : value.titleHi}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {language === "en" ? value.description : value.descriptionHi}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/green-rice-fields.jpg"
            alt="Lush green rice fields"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/95" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <AnimatedSection className="text-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-accent to-orange-500 mb-8 shadow-xl"
            >
              <Award className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {language === "en" ? "Awards & Certifications" : "पुरस्कार और प्रमाणन"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-lg">
              {language === "en"
                ? "Our commitment to quality and innovation has been recognized by leading industry bodies."
                : "गुणवत्ता और नवाचार के प्रति हमारी प्रतिबद्धता को प्रमुख उद्योग निकायों द्वारा मान्यता दी गई है।"}
            </p>
            
            <AnimatedContainer className="flex flex-wrap justify-center gap-4" staggerDelay={0.1}>
              {["ISO 9001:2015", "CIB Certified", "FICCI Award 2023", "Best Quality Award", "Excellence in Agriculture"].map(
                (award, index) => (
                  <AnimatedItem key={index} direction="scale">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="px-8 py-4 shadow-lg border-0 bg-white">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-gray-800">{award}</span>
                        </div>
                      </Card>
                    </motion.div>
                  </AnimatedItem>
                )
              )}
            </AnimatedContainer>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

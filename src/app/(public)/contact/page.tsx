"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Loader2,
  Headphones,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";
import {
  AnimatedSection,
  AnimatedContainer,
  AnimatedItem,
  FloatingElement,
} from "@/components/ui/animated-section";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    titleHi: "पता",
    content: "Agrio India Crop Science\nE-31 Industrial Area,\nSikandrabad, Bulandshahr - 203205",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Mail,
    title: "Email",
    titleHi: "ईमेल",
    content: "agrioindiacropsciences@gmail.com",
    link: "mailto:agrioindiacropsciences@gmail.com",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Phone,
    title: "Phone",
    titleHi: "फ़ोन",
    content: "+91 95206 09999",
    link: "tel:+919520609999",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Clock,
    title: "Working Hours",
    titleHi: "कार्य समय",
    content: "Mon - Sat: 9:00 AM - 6:00 PM\nSunday: Closed",
    color: "from-orange-500 to-amber-500",
  },
];

export default function ContactPage() {
  const { language } = useStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await api.submitContactForm({
        name: data.name,
        mobile: data.mobile,
        email: data.email || undefined,
        subject: data.subject,
        message: data.message,
      });
      
      if (response.success) {
        toast({
          title: language === "en" ? "Message Sent!" : "संदेश भेजा गया!",
          description: response.data?.message || (language === "en"
            ? "We'll get back to you as soon as possible."
            : "हम जल्द से जल्द आपसे संपर्क करेंगे।"),
          variant: "success",
        });
        
        reset();
      } else {
        toast({
          title: language === "en" ? "Error" : "त्रुटि",
          description: response.error?.message || (language === "en"
            ? "Failed to send message. Please try again."
            : "संदेश भेजने में विफल। कृपया पुनः प्रयास करें।"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: language === "en"
          ? "Something went wrong. Please try again."
          : "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Header */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/mesmerizing-shot-scenic-cloudy-sky-field.jpg"
            alt="Beautiful field with scenic cloudy sky"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        </div>

        {/* Floating decorations */}
        <FloatingElement className="absolute top-20 right-20 opacity-20" duration={5}>
          <Headphones className="h-24 w-24 text-white" />
        </FloatingElement>

        <div className="container mx-auto px-4 lg:px-8 relative py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-2">
              <MessageCircle className="h-4 w-4 mr-2" />
              {language === "en" ? "We're Here to Help" : "हम यहाँ मदद के लिए हैं"}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {language === "en" ? "Contact Us" : "संपर्क करें"}
            </h1>
            <p className="text-xl opacity-90">
              {language === "en"
                ? "We'd love to hear from you. Send us a message and we'll respond as soon as possible."
                : "हमें आपसे सुनना अच्छा लगेगा। हमें एक संदेश भेजें और हम जल्द से जल्द जवाब देंगे।"}
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

      {/* Contact Info Cards */}
      <section className="py-12 -mt-12 relative z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {contactInfo.map((info, index) => (
              <AnimatedItem key={index} direction="scale">
                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                  <Card className="h-full border-0 shadow-xl overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${info.color}`} />
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-4 shadow-lg`}
                      >
                        <info.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-lg mb-2">
                        {language === "en" ? info.title : info.titleHi}
                      </h3>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-sm text-primary hover:underline whitespace-pre-line"
                        >
                          {info.content}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-600 whitespace-pre-line">
                          {info.content}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gradient-to-b from-white to-secondary/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left Side - Info */}
            <AnimatedSection direction="left" className="lg:col-span-2 space-y-8">
              <div>
                <Badge variant="outline" className="mb-4">
                  {language === "en" ? "Get In Touch" : "संपर्क में रहें"}
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {language === "en" ? "Let's Start a Conversation" : "बातचीत शुरू करें"}
                </h2>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Have questions about our products or services? Our team is here to help you with all your agricultural needs."
                    : "हमारे उत्पादों या सेवाओं के बारे में प्रश्न हैं? हमारी टीम आपकी सभी कृषि जरूरतों में मदद करने के लिए यहां है।"}
                </p>
              </div>

              {/* WhatsApp CTA */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">WhatsApp Support</h3>
                    <p className="text-sm opacity-90">
                      {language === "en" ? "Quick response on WhatsApp" : "WhatsApp पर त्वरित प्रतिक्रिया"}
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full mt-4 text-green-600"
                >
                  <a href="https://wa.me/919429693729" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    +91 94296 93729
                  </a>
                </Button>
              </motion.div>

              {/* Office Image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative h-64 rounded-2xl overflow-hidden shadow-xl"
              >
                <Image
                  src="/green-rice-fields.jpg"
                  alt="Agrio India Office"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {language === "en" ? "Our Headquarters" : "हमारा मुख्यालय"}
                  </p>
                  <p className="text-sm opacity-80">Bulandshahr, UP</p>
                </div>
              </motion.div>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection direction="right" delay={0.2} className="lg:col-span-3">
              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-emerald-500 to-accent" />
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Send className="h-6 w-6 text-primary" />
                    {language === "en" ? "Send us a Message" : "हमें संदेश भेजें"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          {language === "en" ? "Name" : "नाम"} *
                        </Label>
                        <Input
                          id="name"
                          placeholder={language === "en" ? "Your full name" : "आपका पूरा नाम"}
                          {...register("name")}
                          className="h-12 rounded-xl"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Mobile */}
                      <div className="space-y-2">
                        <Label htmlFor="mobile" className="text-sm font-medium">
                          {language === "en" ? "Mobile Number" : "मोबाइल नंबर"} *
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                            +91
                          </span>
                          <Input
                            id="mobile"
                            placeholder="9876543210"
                            className="pl-14 h-12 rounded-xl"
                            {...register("mobile")}
                          />
                        </div>
                        {errors.mobile && (
                          <p className="text-sm text-destructive">{errors.mobile.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {language === "en" ? "Email (Optional)" : "ईमेल (वैकल्पिक)"}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="h-12 rounded-xl"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        {language === "en" ? "Subject" : "विषय"} *
                      </Label>
                      <Input
                        id="subject"
                        placeholder={language === "en" ? "What is this about?" : "यह किस बारे में है?"}
                        className="h-12 rounded-xl"
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        {language === "en" ? "Message" : "संदेश"} *
                      </Label>
                      <Textarea
                        id="message"
                        placeholder={language === "en" ? "Your message..." : "आपका संदेश..."}
                        rows={5}
                        className="rounded-xl resize-none"
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        type="submit" 
                        size="lg" 
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {language === "en" ? "Sending..." : "भेज रहे हैं..."}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            {language === "en" ? "Send Message" : "संदेश भेजें"}
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <AnimatedSection className="text-center mb-8">
            <h2 className="text-3xl font-bold">
              {language === "en" ? "Our Location" : "हमारा स्थान"}
            </h2>
            <p className="text-gray-600 mt-2">
              {language === "en" ? "Visit us at our headquarters" : "हमारे मुख्यालय में हमसे मिलें"}
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={0.2}>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-96 bg-gray-200 relative">
                <iframe
                  src="https://maps.google.com/maps?q=Agrio+India+Crop+Science,+E-31,+industrial+area,+Gopalpur,+Sikandrabad,+Uttar+Pradesh+201314&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Agrio India Crop Science Location"
                />
              </div>
              <div className="p-4 bg-white border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm">Agrio India Crop Science, E-31 Industrial Area, Sikandrabad</span>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a 
                    href="https://www.google.com/maps/dir//Agrio+India+Crop+Science,+E-31,+industrial+area,+Gopalpur,+Sikandrabad,+Uttar+Pradesh+201314/@28.490681,77.6550442,15z" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {language === "en" ? "Get Directions" : "दिशा प्राप्त करें"}
                  </a>
                </Button>
              </div>
            </Card>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

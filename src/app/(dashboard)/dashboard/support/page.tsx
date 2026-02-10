"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Headphones,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/store/useStore";
import { useFaqs } from "@/hooks/useApi";

const contactOptions = [
  {
    icon: Phone,
    title: "Call Us",
    titleHi: "कॉल करें",
    description: "Mon-Sat, 9AM-6PM",
    descriptionHi: "सोम-शनि, 9AM-6PM",
    action: "tel:+919520609999",
    actionLabel: "+91 95206 09999",
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    titleHi: "व्हाट्सएप",
    description: "Instant Reply",
    descriptionHi: "तुरंत जवाब",
    action: "https://wa.me/919429693729",
    actionLabel: "Chat Now",
    actionLabelHi: "चैट करें",
    gradient: "from-green-500 to-emerald-600",
    bgLight: "bg-green-50",
  },
  {
    icon: Mail,
    title: "Email",
    titleHi: "ईमेल",
    description: "24h Response",
    descriptionHi: "24 घंटे में जवाब",
    action: "mailto:agrioindiacropsciences@gmail.com",
    actionLabel: "Send Email",
    actionLabelHi: "ईमेल भेजें",
    gradient: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50",
  },
];

export default function SupportPage() {
  const { language } = useStore();
  const { data: faqs, loading: faqsLoading } = useFaqs();

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-start gap-6">
          <div className="hidden sm:flex h-16 w-16 rounded-2xl bg-white/20 backdrop-blur items-center justify-center flex-shrink-0">
            <Headphones className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {language === "en" ? "How can we help you?" : "हम आपकी कैसे मदद कर सकते हैं?"}
            </h1>
            <p className="text-white/80 max-w-lg">
              {language === "en"
                ? "Get instant support for your account, rewards, and products. We're here to help!"
                : "अपने खाते, पुरस्कार और उत्पादों के लिए तुरंत सहायता प्राप्त करें।"}
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-white/70">
              <Clock className="h-4 w-4" />
              <span>{language === "en" ? "Average response time: 2 hours" : "औसत प्रतिक्रिया समय: 2 घंटे"}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contact Options */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {language === "en" ? "Get in Touch" : "संपर्क करें"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {contactOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a 
                href={option.action} 
                target={option.action.startsWith("http") ? "_blank" : undefined} 
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Gradient header */}
                    <div className={`h-2 bg-gradient-to-r ${option.gradient}`} />
                    
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-xl ${option.bgLight} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <option.icon className={`h-6 w-6 bg-gradient-to-r ${option.gradient} bg-clip-text`} style={{ color: option.gradient.includes('blue') ? '#3b82f6' : option.gradient.includes('green') ? '#22c55e' : '#a855f7' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900">
                            {language === "en" ? option.title : option.titleHi}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {language === "en" ? option.description : option.descriptionHi}
                          </p>
                          <p className={`text-sm font-medium mt-2 flex items-center gap-1 bg-gradient-to-r ${option.gradient} bg-clip-text text-transparent`}>
                            {language === "en" ? option.actionLabel : (option.actionLabelHi || option.actionLabel)}
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" style={{ color: option.gradient.includes('blue') ? '#3b82f6' : option.gradient.includes('green') ? '#22c55e' : '#a855f7' }} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          {language === "en" ? "Frequently Asked Questions" : "अक्सर पूछे जाने वाले प्रश्न"}
        </h2>
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-0">
            {faqsLoading ? (
              <div className="py-10 flex justify-center text-sm text-gray-500">
                {language === "en" ? "Loading FAQs..." : "प्रश्न लोड हो रहे हैं..."}
              </div>
            ) : faqs && faqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id ?? index}
                    value={`item-${index}`}
                    className="border-b last:border-b-0"
                  >
                    <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-gray-50 transition-colors">
                      <span className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">
                          {language === "en" ? faq.question : faq.question_hi || faq.question}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-4 pt-0">
                      <div className="pl-9 text-gray-600 leading-relaxed">
                        {language === "en" ? faq.answer : faq.answer_hi || faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-10 px-5 text-sm text-gray-500">
                {language === "en"
                  ? "No FAQs are available at the moment."
                  : "इस समय कोई प्रश्न उपलब्ध नहीं हैं।"}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Still need help banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center flex-shrink-0">
                <HelpCircle className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-gray-900">
                  {language === "en" ? "Still have questions?" : "अभी भी सवाल हैं?"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {language === "en"
                    ? "Can't find what you're looking for? Send us a message."
                    : "जो ढूंढ रहे हैं वो नहीं मिल रहा? हमें संदेश भेजें।"}
                </p>
              </div>
              <Button asChild className="shadow-lg">
                <Link href="/contact">
                  {language === "en" ? "Contact Us" : "संपर्क करें"}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


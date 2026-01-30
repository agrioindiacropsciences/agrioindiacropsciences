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

const faqs = [
  {
    question: "How do I scan a coupon code?",
    questionHi: "मैं कूपन कोड कैसे स्कैन करूं?",
    answer: "Go to the Scan & Win section in your dashboard. You can either scan the QR code on your product or enter the 12-character code manually.",
    answerHi: "अपने डैशबोर्ड में स्कैन और जीतें सेक्शन पर जाएं। आप या तो अपने उत्पाद पर QR कोड स्कैन कर सकते हैं या 12-अक्षर का कोड मैन्युअल रूप से दर्ज कर सकते हैं।",
  },
  {
    question: "How do I redeem my rewards?",
    questionHi: "मैं अपने पुरस्कार कैसे भुनाऊं?",
    answer: "Visit the My Rewards section to see all your earned rewards. You can download the reward certificate and redeem it at any authorized Agrio India distributor.",
    answerHi: "अपने सभी अर्जित पुरस्कार देखने के लिए मेरे पुरस्कार सेक्शन पर जाएं। आप पुरस्कार प्रमाणपत्र डाउनलोड कर सकते हैं और किसी भी अधिकृत एग्रियो इंडिया वितरक पर इसे भुना सकते हैं।",
  },
  {
    question: "What if my coupon code is invalid?",
    questionHi: "अगर मेरा कूपन कोड अमान्य है तो क्या होगा?",
    answer: "Make sure you are entering the code correctly. If the code is still invalid, please contact our support team with a photo of the coupon.",
    answerHi: "सुनिश्चित करें कि आप कोड सही ढंग से दर्ज कर रहे हैं। यदि कोड अभी भी अमान्य है, तो कृपया कूपन की फोटो के साथ हमारी सहायता टीम से संपर्क करें।",
  },
  {
    question: "How do I find a distributor near me?",
    questionHi: "मैं अपने पास वितरक कैसे खोजूं?",
    answer: "Use the Buy Nearby feature in your dashboard. Enter your pincode or use your current location to find authorized distributors in your area.",
    answerHi: "अपने डैशबोर्ड में पास में खरीदें सुविधा का उपयोग करें। अपने क्षेत्र में अधिकृत वितरकों को खोजने के लिए अपना पिनकोड दर्ज करें या अपने वर्तमान स्थान का उपयोग करें।",
  },
  {
    question: "Can I change my registered mobile number?",
    questionHi: "क्या मैं अपना पंजीकृत मोबाइल नंबर बदल सकता हूं?",
    answer: "For security reasons, mobile number cannot be changed directly. Please contact our support team to request a mobile number change.",
    answerHi: "सुरक्षा कारणों से, मोबाइल नंबर सीधे नहीं बदला जा सकता। कृपया मोबाइल नंबर बदलने के अनुरोध के लिए हमारी सहायता टीम से संपर्क करें।",
  },
];

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
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-b last:border-b-0"
                >
                  <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-gray-50 transition-colors">
                    <span className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {language === "en" ? faq.question : faq.questionHi}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4 pt-0">
                    <div className="pl-9 text-gray-600 leading-relaxed">
                      {language === "en" ? faq.answer : faq.answerHi}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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


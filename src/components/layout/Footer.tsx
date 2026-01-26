"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Facebook, Youtube, MessageCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

const quickLinks = [
  { href: "/", label: "Home", labelHi: "होम" },
  { href: "/products", label: "Products", labelHi: "उत्पाद" },
  { href: "/best-selling", label: "Best Selling", labelHi: "बेस्ट सेलिंग" },
  { href: "/scan-win", label: "Scan & Win", labelHi: "स्कैन और जीतें" },
  { href: "/buy-nearby", label: "Buy Nearby", labelHi: "पास में खरीदें" },
  { href: "/contact", label: "Contact Us", labelHi: "संपर्क करें" },
];

const productCategories = [
  { href: "/products?category=insecticide", label: "Insecticides", labelHi: "कीटनाशक" },
  { href: "/products?category=fungicide", label: "Fungicides", labelHi: "फफूंदनाशक" },
  { href: "/products?category=herbicide", label: "Herbicides", labelHi: "खरपतवारनाशक" },
  { href: "/products?category=pgr", label: "Plant Growth Regulators", labelHi: "पौध वृद्धि नियामक" },
];

const supportLinks = [
  { href: "/about", label: "About Us", labelHi: "हमारे बारे में" },
  { href: "/contact", label: "Contact Us", labelHi: "संपर्क करें" },
  { href: "/privacy-policy", label: "Privacy Policy", labelHi: "गोपनीयता नीति" },
  { href: "/terms", label: "Terms of Service", labelHi: "सेवा की शर्तें" },
];

export function Footer() {
  const { language } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Agrio India Logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
              <div>
                <h3 className="text-lg font-bold">Agrio India</h3>
                <p className="text-xs text-gray-400">Crop Science</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {language === "en"
                ? "Agrio Sampan kisan - Empowering Indian farmers with high-quality crop solutions for a prosperous future."
                : "एग्रियो संपन किसान - समृद्ध भविष्य के लिए उच्च गुणवत्ता वाले फसल समाधानों के साथ भारतीय किसानों को सशक्त बनाना।"}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 hover:bg-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/919429693729"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {language === "en" ? "Quick Links" : "त्वरित लिंक"}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {language === "en" ? link.label : link.labelHi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {language === "en" ? "Products" : "उत्पाद"}
            </h4>
            <ul className="space-y-2">
              {productCategories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {language === "en" ? link.label : link.labelHi}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
              {language === "en" ? "Contact Info" : "संपर्क जानकारी"}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-gray-400">
                  Agrio India Crop Science<br />
                  E-31 Industrial Area,<br />
                  Sikandrabad, Bulandshahr - 203205
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="mailto:agrioindiacropsciences@gmail.com"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  agrioindiacropsciences@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href="tel:+919520609999"
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  +91 95206 09999
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Agrio India Crop Science. {language === "en" ? "All Rights Reserved." : "सर्वाधिकार सुरक्षित।"}
            </p>
            <div className="flex items-center gap-4">
              {supportLinks.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-primary transition-colors"
                >
                  {language === "en" ? link.label : link.labelHi}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <p className="text-center text-xs text-gray-500">
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


"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Globe,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", labelHi: "होम" },
  { href: "/products", label: "Products", labelHi: "उत्पाद" },
  { href: "/best-selling", label: "Best Selling", labelHi: "बेस्ट सेलिंग" },
  { href: "/scan-win", label: "Scan & Win", labelHi: "स्कैन और जीतें", highlight: true },
  { href: "/buy-nearby", label: "Buy Nearby", labelHi: "पास में खरीदें" },
  { href: "/contact", label: "Contact", labelHi: "संपर्क" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { language, setLanguage, isAuthenticated, user, logout } = useStore();

  // Check if current page is homepage
  const isHomePage = pathname === "/";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // For non-homepage, always show scrolled (fixed) style
  const showScrolledStyle = !isHomePage || scrolled;

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          showScrolledStyle
            ? "py-2"
            : "py-4"
        )}
      >
        {/* Glassmorphism background */}
        <motion.div 
          className={cn(
            "absolute inset-0 transition-all duration-500",
            showScrolledStyle
              ? "bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-b border-gray-100"
              : "bg-transparent"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <nav className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex h-14 lg:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                {/* Logo glow effect */}
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                  src="/logo.svg"
                  alt="Agrio India Logo"
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain relative z-10"
                  priority
                />
              </motion.div>
              <div className="hidden sm:block">
                <motion.h1 
                  className="text-xl font-bold bg-gradient-to-r from-primary via-emerald-600 to-primary bg-[length:200%_auto] bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ["0%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  Agrio
                </motion.h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">India Crop Science Pvt. Ltd.</p>
              </div>
            </Link>

            {/* Desktop Navigation - Pill Style */}
            <div className="hidden lg:flex items-center">
              <motion.div 
                className={cn(
                  "flex items-center gap-1 p-1.5 rounded-full transition-all duration-500",
                  showScrolledStyle ? "bg-gray-100/80" : "bg-white/90 shadow-lg shadow-black/5"
                )}
                layout
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative px-4 py-2"
                  >
                    {/* Hover/Active background pill */}
                    <AnimatePresence>
                      {(pathname === item.href || hoveredItem === item.href) && (
                        <motion.div
                          layoutId="navPill"
                          className={cn(
                            "absolute inset-0 rounded-full",
                            pathname === item.href
                              ? "bg-gradient-to-r from-primary to-emerald-500"
                              : "bg-gray-200/80"
                          )}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <span
                      className={cn(
                        "relative z-10 text-sm font-medium transition-colors duration-200",
                        pathname === item.href
                          ? "text-white"
                          : hoveredItem === item.href
                          ? "text-gray-900"
                          : "text-gray-600"
                      )}
                    >
                      {language === "en" ? item.label : item.labelHi}
                    </span>
                    
                    {/* Highlight badge for Scan & Win */}
                    {item.highlight && pathname !== item.href && (
                      <motion.span 
                        className="absolute -top-1 -right-1 flex h-2.5 w-2.5"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-orange-400 to-amber-500"></span>
                      </motion.span>
                    )}
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Language Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className={cn(
                    "hidden sm:flex items-center gap-2 text-sm font-medium rounded-full px-4 h-10 transition-all duration-300",
                    showScrolledStyle ? "hover:bg-gray-100" : "bg-white/90 shadow-md hover:shadow-lg"
                  )}
                >
                  <Globe className="h-4 w-4" />
                  <span className="font-semibold">{language === "en" ? "हिंदी" : "EN"}</span>
                </Button>
              </motion.div>

              {/* Auth Button / User Menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "gap-2 rounded-full pr-3 h-10 transition-all duration-300",
                        showScrolledStyle ? "hover:bg-gray-100" : "bg-white/90 shadow-md hover:shadow-lg"
                      )}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-500 text-white text-sm font-semibold shadow-inner"
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </motion.div>
                      <span className="hidden md:inline-block font-medium text-gray-700">{user.name.split(" ")[0]}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 mt-2 rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-xl">
                    <div className="px-3 py-4 border-b mb-2 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl -mt-1 -mx-1">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.mobile}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11">
                      <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                        </div>
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl h-11">
                      <Link href="/dashboard/profile" className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-500" />
                        </div>
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-xl h-11"
                    >
                      <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center mr-3">
                        <LogOut className="h-4 w-4" />
                      </div>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    asChild 
                    size="sm" 
                    className="hidden sm:inline-flex rounded-full px-6 h-10 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 border-0"
                  >
                    <Link href="/auth">
                      <span className="font-semibold">Login</span>
                    </Link>
                  </Button>
                </motion.div>
              )}

              {/* Mobile Menu Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setMobileMenuOpen(true)}
                  className={cn(
                    "lg:hidden rounded-full h-10 w-10 transition-all duration-300",
                    showScrolledStyle ? "hover:bg-gray-100" : "bg-white/90 shadow-md hover:shadow-lg"
                  )}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-5 border-b">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/logo.svg"
                      alt="Agrio India Logo"
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                    <div>
                      <span className="font-bold text-primary text-lg">Agrio</span>
                      <p className="text-[10px] text-gray-400 tracking-wider uppercase">India Crop Science Pvt. Ltd.</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </motion.button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto p-5">
                  <div className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold transition-all",
                            pathname === item.href
                              ? "bg-gradient-to-r from-primary to-emerald-500 text-white shadow-lg shadow-primary/20"
                              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                          )}
                        >
                          <span>{language === "en" ? item.label : item.labelHi}</span>
                          {item.highlight && pathname !== item.href ? (
                            <span className="flex h-2.5 w-2.5 rounded-full bg-orange-400 animate-pulse"></span>
                          ) : (
                            <ArrowRight className={cn(
                              "h-5 w-5 transition-transform",
                              pathname === item.href ? "text-white/70" : "text-gray-300"
                            )} />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Mobile Footer */}
                <div className="border-t p-5 space-y-3 bg-gray-50/50">
                  <Button
                    variant="outline"
                    onClick={toggleLanguage}
                    className="w-full justify-center gap-3 h-12 rounded-xl font-semibold border-2"
                  >
                    <Globe className="h-5 w-5" />
                    {language === "en" ? "हिंदी में बदलें" : "Switch to English"}
                  </Button>
                  {isAuthenticated ? (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full h-12 rounded-xl font-semibold"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      className="w-full h-12 rounded-xl shadow-lg bg-gradient-to-r from-primary to-emerald-500 font-semibold"
                    >
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                        Login / Register
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Ticket,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAdminStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import * as api from "@/lib/api";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/distributors", icon: MapPin, label: "Distributors" },
  { href: "/admin/reports", icon: BarChart3, label: "Reports" },
];

const bottomNavItems = [
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAdminAuthenticated, adminLogout, setAdmin, setAdminAuthenticated } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount/refresh
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getAdminToken();
      
      if (!token) {
        // No token - redirect to login
        setAdminAuthenticated(false);
        setIsCheckingAuth(false);
        router.push("/admin/login");
        return;
      }

      // Token exists - validate it by checking dashboard stats (lightweight check)
      try {
        const response = await api.getDashboardStats();
        if (response.success && response.data) {
          // Token is valid - check if admin data exists in store, if not fetch it
          if (!admin) {
            // Admin data not in store - we can set a basic admin object
            // In a real app, you might want to fetch admin profile
            setAdmin({
              id: "admin",
              name: "Admin",
              email: "admin@agrioindia.com",
              role: "ADMIN"
            });
          }
          setAdminAuthenticated(true);
        } else {
          // Token invalid - clear and redirect
          api.clearAdminTokens();
          setAdminAuthenticated(false);
          router.push("/admin/login");
        }
      } catch (error) {
        // Error validating token - clear and redirect
        api.clearAdminTokens();
        setAdminAuthenticated(false);
        router.push("/admin/login");
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router, setAdmin, setAdminAuthenticated, admin]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated after check
  if (!isAdminAuthenticated || !admin) {
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex flex-col h-full bg-gray-900 text-white", mobile ? "p-4" : "p-6")}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/logo.svg"
          alt="Agrio India Logo"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
        <div>
          <h1 className="font-bold">Agrio</h1>
          <p className="text-xs text-gray-400">Crop Science</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4 bg-gray-700" />

      {/* Bottom Navigation */}
      <div className="space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: Mobile Menu + Search */}
            <div className="flex items-center gap-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-gray-900">
                  <Sidebar mobile />
                </SheetContent>
              </Sheet>

              <div className="hidden md:flex items-center">
                <span className="text-sm font-medium text-gray-500">Admin Panel</span>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {admin.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block font-medium">{admin.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}


"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Settings2,
  FileText,
  Shield,
  Wrench,
  Save,
  Mail,
  Phone,
  Globe,
  Database,
  Key,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 sm:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Settings2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-white/70 text-sm">Manage application settings and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-xl flex flex-wrap gap-1">
            <TabsTrigger value="company" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Building2 className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="admins" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Database className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Company Information */}
          <TabsContent value="company">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Company Information
                </CardTitle>
                <CardDescription>Update your company details and branding.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Company Name</Label>
                    <Input defaultValue="Agrio India Crop Science" className="mt-1" />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input defaultValue="Agrio Sampan kisan" className="mt-1" />
                  </div>
                  <div>
                    <Label>Tagline (Hindi)</Label>
                    <Input defaultValue="भारतीय किसान की पहली पसंद" className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Textarea 
                      defaultValue="Agrio India Crop Science, E-31 Industrial Area, Sikandrabad, Bulandshahr - 203205" 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Email
                    </Label>
                    <Input defaultValue="agrioindiacropsciences@gmail.com" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      Phone
                    </Label>
                    <Input defaultValue="+91 95206 09999" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      WhatsApp
                    </Label>
                    <Input defaultValue="+91 94296 93729" className="mt-1" />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      Website URL
                    </Label>
                    <Input defaultValue="https://agrioindia.com" className="mt-1" />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      AI
                    </div>
                    <Button variant="outline">Change Logo</Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Users */}
          <TabsContent value="admins">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Admin Users
                </CardTitle>
                <CardDescription>Manage admin accounts and permissions.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { name: "Admin User", email: "admin@agrioindia.com", role: "Super Admin" },
                  { name: "Manager", email: "manager@agrioindia.com", role: "Admin" },
                  { name: "Support", email: "support@agrioindia.com", role: "Viewer" },
                ].map((admin, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{admin.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{admin.role}</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </motion.div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  + Add New Admin
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Configuration */}
          <TabsContent value="system">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  System Configuration
                </CardTitle>
                <CardDescription>Configure system settings and integrations.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    OTP Service Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label>Provider</Label>
                      <Input defaultValue="MSG91" className="mt-1" />
                    </div>
                    <div>
                      <Label>API Key</Label>
                      <Input type="password" defaultValue="••••••••••" className="mt-1" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    Email Service Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label>SMTP Host</Label>
                      <Input defaultValue="smtp.gmail.com" className="mt-1" />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input defaultValue="587" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Content Management
                </CardTitle>
                <CardDescription>Manage website content and legal documents.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea 
                    className="mt-1 min-h-[200px]"
                    placeholder="Enter your terms and conditions..."
                  />
                </div>
                <div>
                  <Label>Privacy Policy</Label>
                  <Textarea 
                    className="mt-1 min-h-[200px]"
                    placeholder="Enter your privacy policy..."
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance */}
          <TabsContent value="maintenance">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Maintenance
                </CardTitle>
                <CardDescription>System maintenance and utilities.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { title: "Clear Cache", desc: "Clear all cached data", btn: "Clear Cache" },
                  { title: "Database Backup", desc: "Download database backup", btn: "Download Backup" },
                  { title: "View System Logs", desc: "View error and activity logs", btn: "View Logs" },
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Button variant="outline">{item.btn}</Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage security and authentication settings.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input defaultValue="30" className="mt-1 max-w-xs" />
                </div>
                <Separator />
                <div>
                  <Label>IP Whitelist (one per line)</Label>
                  <Textarea 
                    className="mt-1"
                    placeholder="192.168.1.1&#10;10.0.0.1"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button className="shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

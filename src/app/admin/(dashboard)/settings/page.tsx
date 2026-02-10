"use client";

import React, { useEffect, useState } from "react";
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
  Loader2,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { CmsPage, FAQ } from "@/lib/api";

type SettingsData = Record<string, Record<string, unknown>>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "Agrio India Crop Science",
    tagline: "Agrio Sampan kisan",
    tagline_hi: "भारतीय किसान की पहली पसंद",
    address: "Agrio India Crop Science, E-31 Industrial Area, Sikandrabad, Bulandshahr - 203205",
    support_email: "agrioindiacropsciences@gmail.com",
    support_phone: "+91 95206 09999",
    whatsapp_number: "+91 94296 93729",
    website_url: "https://agrioindia.com",
    scan_enabled: true,
    shop_enabled: false,
    referral_enabled: true,
  });
  const [contentForm, setContentForm] = useState({
    terms_en: "",
    terms_hi: "",
    privacy_en: "",
    privacy_hi: "",
  });
  const [termsPageMeta, setTermsPageMeta] = useState<CmsPage | null>(null);
  const [privacyPageMeta, setPrivacyPageMeta] = useState<CmsPage | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [savingTerms, setSavingTerms] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [faqSaving, setFaqSaving] = useState(false);
  const [editingFaq, setEditingFaq] = useState<{
    id?: string;
    question: string;
    question_hi: string;
    answer: string;
    answer_hi: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setContentLoading(true);
      setFaqsLoading(true);
      try {
        const [settingsRes, pagesRes, faqsRes] = await Promise.all([
          api.getAdminSettings(),
          api.getAdminPages(),
          api.getAdminFaqs(),
        ]);

        if (settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data as SettingsData);
          const d = settingsRes.data as Record<string, unknown>;
          const contact = (d.contact || {}) as Record<string, unknown>;
          const flags = (d.feature_flags || {}) as Record<string, unknown>;
          const general = (d.general || {}) as Record<string, unknown>;
          setFormData((prev) => ({
            ...prev,
            support_email: String(contact?.support_email ?? prev.support_email),
            support_phone: String(contact?.support_phone ?? prev.support_phone),
            whatsapp_number: String(contact?.whatsapp_number ?? prev.whatsapp_number),
            scan_enabled: Boolean(flags?.scan_enabled ?? prev.scan_enabled),
            shop_enabled: Boolean(flags?.shop_enabled ?? prev.shop_enabled),
            referral_enabled: Boolean(flags?.referral_enabled ?? prev.referral_enabled),
            company_name: String(general?.company_name ?? prev.company_name),
            address: String(general?.address ?? prev.address),
            website_url: String(general?.website_url ?? prev.website_url),
          }));
        }

        if (pagesRes.success && pagesRes.data) {
          const pages = (pagesRes.data || []) as CmsPage[];
          const terms = pages.find((p) => p.slug === "terms");
          const privacy = pages.find((p) => p.slug === "privacy-policy");

          if (terms) setTermsPageMeta(terms);
          if (privacy) setPrivacyPageMeta(privacy);

          setContentForm((prev) => ({
            ...prev,
            terms_en: terms?.content ?? prev.terms_en,
            terms_hi: terms?.content_hi ?? prev.terms_hi,
            privacy_en: privacy?.content ?? prev.privacy_en,
            privacy_hi: privacy?.content_hi ?? prev.privacy_hi,
          }));
        }

        if (faqsRes.success && faqsRes.data) {
          setFaqs(faqsRes.data);
        }
      } catch (e) {
        console.error("Failed to fetch settings, pages or FAQs:", e);
        toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
      } finally {
        setLoading(false);
        setContentLoading(false);
        setFaqsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        company_name: formData.company_name,
        tagline: formData.tagline,
        tagline_hi: formData.tagline_hi,
        address: formData.address,
        support_email: formData.support_email,
        support_phone: formData.support_phone,
        whatsapp_number: formData.whatsapp_number,
        website_url: formData.website_url,
      };
      const res = await api.updateAdminSettings(payload);
      if (res.success) {
        toast({ title: "Saved", description: "Company settings updated successfully" });
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to save", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFeatureFlags = async () => {
    setSaving(true);
    try {
      const res = await api.updateAdminSettings({
        scan_enabled: formData.scan_enabled,
        shop_enabled: formData.shop_enabled,
        referral_enabled: formData.referral_enabled,
      });
      if (res.success) {
        toast({ title: "Saved", description: "Feature flags updated" });
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to save", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTerms = async () => {
    setSavingTerms(true);
    try {
      const base = termsPageMeta || {
        slug: "terms",
        title: "Terms & Conditions",
        title_hi: "नियम और शर्तें",
        content: "",
        content_hi: "",
        updated_at: new Date().toISOString(),
      };

      const res = await api.updatePage("terms", {
        title: base.title,
        title_hi: base.title_hi,
        content: contentForm.terms_en,
        content_hi: contentForm.terms_hi,
      });

      if (res.success) {
        toast({
          title: "Saved",
          description: "Terms & Conditions updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: res.error?.message || "Failed to save Terms & Conditions",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to save terms page:", e);
      toast({
        title: "Error",
        description: "Failed to save Terms & Conditions",
        variant: "destructive",
      });
    } finally {
      setSavingTerms(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      const base = privacyPageMeta || {
        slug: "privacy-policy",
        title: "Privacy Policy",
        title_hi: "गोपनीयता नीति",
        content: "",
        content_hi: "",
        updated_at: new Date().toISOString(),
      };

      const res = await api.updatePage("privacy-policy", {
        title: base.title,
        title_hi: base.title_hi,
        content: contentForm.privacy_en,
        content_hi: contentForm.privacy_hi,
      });

      if (res.success) {
        toast({
          title: "Saved",
          description: "Privacy Policy updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: res.error?.message || "Failed to save Privacy Policy",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to save privacy policy page:", e);
      toast({
        title: "Error",
        description: "Failed to save Privacy Policy",
        variant: "destructive",
      });
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleEditFaq = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq({
        id: faq.id,
        question: faq.question,
        question_hi: faq.question_hi || "",
        answer: faq.answer,
        answer_hi: faq.answer_hi || "",
        category: faq.category || "",
      });
    } else {
      setEditingFaq({
        question: "",
        question_hi: "",
        answer: "",
        answer_hi: "",
        category: "",
      });
    }
  };

  const handleSaveFaq = async () => {
    if (!editingFaq) return;
    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      toast({
        title: "Validation",
        description: "Question and answer (English) are required",
        variant: "destructive",
      });
      return;
    }

    setFaqSaving(true);
    try {
      const payload: Partial<FAQ> = {
        question: editingFaq.question,
        question_hi: editingFaq.question_hi,
        answer: editingFaq.answer,
        answer_hi: editingFaq.answer_hi,
        category: editingFaq.category,
      };

      const res = editingFaq.id
        ? await api.updateFaq(editingFaq.id, payload)
        : await api.createFaq(payload);

      if (res.success && res.data) {
        const updated = res.data;
        setFaqs((prev) => {
          if (editingFaq.id) {
            return prev.map((f) => (f.id === editingFaq.id ? updated : f));
          }
          return [...prev, updated];
        });
        setEditingFaq(null);
        toast({
          title: "Saved",
          description: "FAQ saved successfully",
        });
      } else {
        toast({
          title: "Error",
          description: res.error?.message || "Failed to save FAQ",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to save FAQ:", e);
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Delete this FAQ permanently?")) return;
    try {
      const res = await api.deleteFaq(id);
      if (res.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        if (editingFaq?.id === id) setEditingFaq(null);
        toast({
          title: "Deleted",
          description: "FAQ deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: res.error?.message || "Failed to delete FAQ",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Failed to delete FAQ:", e);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData((p) => ({ ...p, company_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={formData.tagline}
                      onChange={(e) => setFormData((p) => ({ ...p, tagline: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tagline (Hindi)</Label>
                    <Input
                      value={formData.tagline_hi}
                      onChange={(e) => setFormData((p) => ({ ...p, tagline_hi: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Textarea
                      value={formData.address}
                      onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Email
                    </Label>
                    <Input
                      value={formData.support_email}
                      onChange={(e) => setFormData((p) => ({ ...p, support_email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      Phone
                    </Label>
                    <Input
                      value={formData.support_phone}
                      onChange={(e) => setFormData((p) => ({ ...p, support_phone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      WhatsApp
                    </Label>
                    <Input
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData((p) => ({ ...p, whatsapp_number: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      Website URL
                    </Label>
                    <Input
                      value={formData.website_url}
                      onChange={(e) => setFormData((p) => ({ ...p, website_url: e.target.value }))}
                      className="mt-1"
                    />
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
                  <Button className="shadow-lg" onClick={handleSaveCompany} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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

          {/* System Configuration - Feature Flags */}
          <TabsContent value="system">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Feature Flags
                </CardTitle>
                <CardDescription>Enable or disable app features.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Scan & Win</p>
                      <p className="text-sm text-gray-500">Allow users to scan QR codes and win rewards</p>
                    </div>
                    <Switch
                      checked={formData.scan_enabled}
                      onCheckedChange={(v) => setFormData((p) => ({ ...p, scan_enabled: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Shop</p>
                      <p className="text-sm text-gray-500">Enable in-app shopping</p>
                    </div>
                    <Switch
                      checked={formData.shop_enabled}
                      onCheckedChange={(v) => setFormData((p) => ({ ...p, shop_enabled: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Referral</p>
                      <p className="text-sm text-gray-500">Enable referral rewards program</p>
                    </div>
                    <Switch
                      checked={formData.referral_enabled}
                      onCheckedChange={(v) => setFormData((p) => ({ ...p, referral_enabled: v }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="shadow-lg" onClick={handleSaveFeatureFlags} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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
                {contentLoading ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-8">
                      {/* Terms & Conditions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">
                            Terms &amp; Conditions
                          </Label>
                          <Button
                            size="sm"
                            className="shadow-sm"
                            onClick={handleSaveTerms}
                            disabled={savingTerms}
                          >
                            {savingTerms ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Terms
                          </Button>
                        </div>
                        <Textarea
                          className="mt-1 min-h-[160px]"
                          placeholder="Enter your Terms &amp; Conditions (English)..."
                          value={contentForm.terms_en}
                          onChange={(e) =>
                            setContentForm((prev) => ({ ...prev, terms_en: e.target.value }))
                          }
                        />
                        <Textarea
                          className="mt-2 min-h-[140px]"
                          placeholder="अपनी नियम और शर्तें (हिंदी) दर्ज करें..."
                          value={contentForm.terms_hi}
                          onChange={(e) =>
                            setContentForm((prev) => ({ ...prev, terms_hi: e.target.value }))
                          }
                        />
                      </div>

                      {/* Privacy Policy */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="font-semibold">
                            Privacy Policy
                          </Label>
                          <Button
                            size="sm"
                            className="shadow-sm"
                            onClick={handleSavePrivacy}
                            disabled={savingPrivacy}
                          >
                            {savingPrivacy ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Privacy
                          </Button>
                        </div>
                        <Textarea
                          className="mt-1 min-h-[160px]"
                          placeholder="Enter your Privacy Policy (English)..."
                          value={contentForm.privacy_en}
                          onChange={(e) =>
                            setContentForm((prev) => ({ ...prev, privacy_en: e.target.value }))
                          }
                        />
                        <Textarea
                          className="mt-2 min-h-[140px]"
                          placeholder="अपनी गोपनीयता नीति (हिंदी) दर्ज करें..."
                          value={contentForm.privacy_hi}
                          onChange={(e) =>
                            setContentForm((prev) => ({ ...prev, privacy_hi: e.target.value }))
                          }
                        />
                      </div>

                      {/* FAQs Management */}
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <span className="font-semibold">FAQs</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => handleEditFaq()}
                          >
                            <Plus className="h-4 w-4" />
                            Add FAQ
                          </Button>
                        </div>

                        {faqsLoading ? (
                          <div className="py-6 flex justify-center text-sm text-gray-500">
                            Loading FAQs...
                          </div>
                        ) : faqs.length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No FAQs created yet. Click &quot;Add FAQ&quot; to create one.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {faqs.map((faq) => (
                              <div
                                key={faq.id}
                                className="flex items-start justify-between rounded-lg border bg-gray-50 px-3 py-2"
                              >
                                <div className="pr-3">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {faq.question}
                                  </p>
                                  {faq.category && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Category: {faq.category}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => handleEditFaq(faq)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50"
                                    onClick={() => handleDeleteFaq(faq.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {editingFaq && (
                          <div className="mt-4 space-y-3 rounded-lg border bg-white p-4">
                            <p className="font-semibold text-sm mb-1">
                              {editingFaq.id ? "Edit FAQ" : "New FAQ"}
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Question (English)</Label>
                                <Input
                                  className="mt-1"
                                  value={editingFaq.question}
                                  onChange={(e) =>
                                    setEditingFaq((prev) =>
                                      prev ? { ...prev, question: e.target.value } : prev
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Question (Hindi)</Label>
                                <Input
                                  className="mt-1"
                                  value={editingFaq.question_hi}
                                  onChange={(e) =>
                                    setEditingFaq((prev) =>
                                      prev ? { ...prev, question_hi: e.target.value } : prev
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Answer (English)</Label>
                                <Textarea
                                  className="mt-1 min-h-[90px]"
                                  value={editingFaq.answer}
                                  onChange={(e) =>
                                    setEditingFaq((prev) =>
                                      prev ? { ...prev, answer: e.target.value } : prev
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Answer (Hindi)</Label>
                                <Textarea
                                  className="mt-1 min-h-[90px]"
                                  value={editingFaq.answer_hi}
                                  onChange={(e) =>
                                    setEditingFaq((prev) =>
                                      prev ? { ...prev, answer_hi: e.target.value } : prev
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Category (optional)</Label>
                              <Input
                                className="mt-1 max-w-xs"
                                placeholder="e.g. getting_started, support"
                                value={editingFaq.category}
                                onChange={(e) =>
                                  setEditingFaq((prev) =>
                                    prev ? { ...prev, category: e.target.value } : prev
                                  )
                                }
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingFaq(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveFaq}
                                disabled={faqSaving}
                              >
                                {faqSaving ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4 mr-2" />
                                )}
                                Save FAQ
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
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

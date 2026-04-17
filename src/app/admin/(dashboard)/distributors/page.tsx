"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Building2,
  CheckCircle2,
  Search,
  Plus,
  FileBadge2,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
  Upload,
  XCircle,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgreementViewer } from "@/components/distributors/AgreementViewer";
import LocationPicker from "@/components/LocationPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Distributor, VerificationStatus } from "@/lib/api";

type ProfileChange = NonNullable<Distributor["profile_changes"]>[number];

function displayValue(value?: string | number | null) {
  if (value == null) return "N/A";
  const text = String(value).trim();
  return text.length > 0 ? text : "N/A";
}

function hasValue(value?: string | number | null) {
  if (value == null) return false;
  return String(value).trim().length > 0;
}

function getAadhaarFrontUrl(distributor?: Distributor | null) {
  return distributor?.aadhaar_front_photo_url || distributor?.aadhaar_photo_url;
}

function getMapLink(distributor?: Distributor | null) {
  if (!distributor?.latitude || !distributor?.longitude) return null;
  return `https://www.google.com/maps?q=${distributor.latitude},${distributor.longitude}`;
}

function DocumentCard({
  title,
  subtitle,
  url,
}: {
  title: string;
  subtitle: string;
  url?: string | null;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-white p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-[4/3] overflow-hidden rounded-xl border bg-slate-50"
        >
          <Image
            src={url}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/35">
            <div className="rounded-full bg-white/90 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <ExternalLink className="h-4 w-4 text-slate-900" />
            </div>
          </div>
        </a>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed bg-slate-50 text-sm text-muted-foreground">
          No document uploaded
        </div>
      )}
    </div>
  );
}

function EditableDocumentCard({
  title,
  subtitle,
  url,
  file,
  inputId,
  onFileSelect,
}: {
  title: string;
  subtitle: string;
  url?: string | null;
  file?: File | null;
  inputId: string;
  onFileSelect: (file: File | null) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="space-y-3 rounded-2xl border bg-white p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-3 rounded-xl border border-dashed bg-slate-50 p-4">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative block aspect-[4/3] overflow-hidden rounded-xl border bg-white">
              <Image
                src={previewUrl}
                alt={`${title} preview`}
                fill
                unoptimized
                sizes="(max-width: 1280px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">Selected file</p>
              <p className="truncate text-xs text-muted-foreground">{file?.name}</p>
            </div>
          </div>
        ) : url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-[4/3] overflow-hidden rounded-xl border bg-white"
          >
            <Image
              src={url}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </a>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed bg-white text-sm text-muted-foreground">
            No document uploaded
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          />
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Upload className="h-4 w-4" />
            {url || file ? "Replace Document" : "Upload Document"}
          </label>
          {file ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFileSelect(null)}
            >
              Clear
            </Button>
          ) : null}
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View current
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
  change,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
  change?: ProfileChange;
}) {
  return (
    <div className={change ? "space-y-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-3" : "space-y-1"}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {change ? (
        <Badge variant="warning" className="w-fit">
          Updated by dealer
        </Badge>
      ) : null}
      <p className={mono ? "font-mono text-sm text-slate-900" : "text-sm font-medium text-slate-900"}>
        {displayValue(value)}
      </p>
      {change ? (
        <p className="text-xs text-amber-800">
          Previous: <span className="font-medium">{displayValue(change.previous)}</span>
        </p>
      ) : null}
    </div>
  );
}

function ProfileChangesSummary({
  changes,
}: {
  changes?: ProfileChange[];
}) {
  if (!changes?.length) return null;

  return (
    <Card className="rounded-3xl border border-amber-200 bg-amber-50/60 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Profile updated after approval</Badge>
          <p className="text-sm font-medium text-amber-900">
            {changes.length} field{changes.length > 1 ? "s" : ""} changed by dealer
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {changes.map((change) => (
            <div
              key={change.field}
              className="rounded-2xl border border-amber-200 bg-white/80 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">{change.label}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Previous</p>
              <p className="text-sm text-slate-700">{displayValue(change.previous)}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">Current</p>
              <p className="text-sm font-medium text-slate-900">{displayValue(change.current)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DistributorsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [isEditDetailLoading, setIsEditDetailLoading] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verifyingDistributor, setVerifyingDistributor] = useState<Distributor | null>(null);
  const [isVerificationDetailLoading, setIsVerificationDetailLoading] = useState(false);
  const [dealerCode, setDealerCode] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    business_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    expected_business_volume: "",
    address_street: "",
    address_area: "",
    city: "",
    state: "",
    pincode: "",
    aadhaar_number: "",
    pan_number: "",
    license_number: "",
    gst_number: "",
    security_deposit_check_number: "",
    bank_name: "",
    dealer_code: "",
    latitude: "",
    longitude: "",
  });
  const [documentFiles, setDocumentFiles] = useState({
    aadhaar_front_photo: null as File | null,
    aadhaar_back_photo: null as File | null,
    pan_photo: null as File | null,
    license_photo: null as File | null,
    gst_photo: null as File | null,
    check_photo: null as File | null,
  });

  const resetForm = () => {
    setFormData({
      business_name: "",
      phone: "",
      whatsapp: "",
      email: "",
      expected_business_volume: "",
      address_street: "",
      address_area: "",
      city: "",
      state: "",
      pincode: "",
      aadhaar_number: "",
      pan_number: "",
      license_number: "",
      gst_number: "",
      security_deposit_check_number: "",
      bank_name: "",
      dealer_code: "",
      latitude: "",
      longitude: "",
    });
    setDocumentFiles({
      aadhaar_front_photo: null,
      aadhaar_back_photo: null,
      pan_photo: null,
      license_photo: null,
      gst_photo: null,
      check_photo: null,
    });
    setEditingDistributor(null);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreementViewerOpen, setAgreementViewerOpen] = useState(false);
  const [viewingAgreementId, setViewingAgreementId] = useState<string | null>(null);

  const verificationProfileChangeMap = useMemo(
    () => new Map((verifyingDistributor?.profile_changes || []).map((change) => [change.field, change])),
    [verifyingDistributor]
  );

  const buildDistributorFormData = () => {
    const payload = new FormData();

    payload.append("name", formData.business_name);
    payload.append("business_name", formData.business_name);
    payload.append("phone", formData.phone);
    payload.append("whatsapp", formData.whatsapp);
    payload.append("email", formData.email);
    payload.append("expected_business_volume", formData.expected_business_volume);
    payload.append("address_street", formData.address_street);
    payload.append("address_area", formData.address_area);
    payload.append("address_city", formData.city);
    payload.append("address_state", formData.state);
    payload.append("address_pincode", formData.pincode);
    payload.append("city", formData.city);
    payload.append("state", formData.state);
    payload.append("pincode", formData.pincode);
    payload.append("aadhaar_number", formData.aadhaar_number);
    payload.append("pan_number", formData.pan_number);
    payload.append("license_number", formData.license_number);
    payload.append("gst_number", formData.gst_number);
    payload.append(
      "security_deposit_check_number",
      formData.security_deposit_check_number
    );
    payload.append("bank_name", formData.bank_name);
    payload.append("dealer_code", formData.dealer_code);

    if (formData.latitude.trim()) payload.append("latitude", formData.latitude.trim());
    if (formData.longitude.trim()) payload.append("longitude", formData.longitude.trim());

    Object.entries(documentFiles).forEach(([key, file]) => {
      if (file) payload.append(key, file);
    });

    return payload;
  };

  const fetchDistributors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminDistributors({
        page,
        limit: 10,
        q: appliedSearchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      });

      if (response.success && response.data) {
        setDistributors(response.data.distributors || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
    }
    setIsLoading(false);
  }, [page, appliedSearchQuery, statusFilter]);

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearchQuery(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const filteredDistributors = useMemo(() => {
    // Backend returns already filtered distributors.
    return distributors;
  }, [distributors]);

  const handleCreateDistributor = async () => {
    if (
      !formData.business_name ||
      !formData.phone ||
      !formData.address_street ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createDistributor({
        name: formData.business_name,
        business_name: formData.business_name,
        phone: formData.phone,
        whatsapp: formData.whatsapp || undefined,
        email: formData.email,
        expected_business_volume: formData.expected_business_volume || undefined,
        aadhaar_number: formData.aadhaar_number || undefined,
        pan_number: formData.pan_number || undefined,
        license_number: formData.license_number || undefined,
        gst_number: formData.gst_number || undefined,
        security_deposit_check_number:
          formData.security_deposit_check_number || undefined,
        bank_name: formData.bank_name || undefined,
        dealer_code: formData.dealer_code || undefined,
        address: {
          street: formData.address_street,
          area: formData.address_area || undefined,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        address_area: formData.address_area || undefined,
        address_city: formData.city,
        address_state: formData.state,
        address_pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Distributor created successfully",
        });
        setAddDialogOpen(false);
        resetForm();
        fetchDistributors();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to create distributor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const populateEditForm = (dist: Distributor) => {
    setFormData({
      business_name: dist.business_name || dist.name || "",
      phone: dist.phone || "",
      whatsapp: "",
      email: dist.email || "",
      expected_business_volume: dist.expected_business_volume || "",
      address_street: dist.address_street || dist.address || "",
      address_area: dist.address_area || "",
      city: dist.city || "",
      state: dist.state || "",
      pincode: dist.pincode || "",
      aadhaar_number: dist.aadhaar_number || "",
      pan_number: dist.pan_number || "",
      license_number: dist.license_number || "",
      gst_number: dist.gst_number || "",
      security_deposit_check_number: dist.security_deposit_check_number || "",
      bank_name: dist.bank_name || "",
      dealer_code: dist.dealer_code || "",
      latitude: dist.latitude?.toString() || "",
      longitude: dist.longitude?.toString() || "",
    });
  };

  const handleEditDistributor = async (dist: Distributor) => {
    setEditingDistributor(dist);
    populateEditForm(dist);
    setEditDialogOpen(true);
    setIsEditDetailLoading(true);

    try {
      const response = await api.getAdminDistributor(dist.id);
      if (response.success && response.data) {
        setEditingDistributor(response.data);
        populateEditForm(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to load distributor details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load distributor details",
        variant: "destructive",
      });
    } finally {
      setIsEditDetailLoading(false);
    }
  };

  const handleUpdateDistributor = async () => {
    if (
      !editingDistributor ||
      !formData.business_name ||
      !formData.phone ||
      !formData.address_street ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.updateDistributor(editingDistributor.id, buildDistributorFormData());

      if (response.success) {
        toast({
          title: "Success",
          description: "Distributor updated successfully",
        });
        setEditDialogOpen(false);
        resetForm();
        fetchDistributors();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update distributor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleDeleteDistributor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this distributor?")) return;

    try {
      const response = await api.deleteDistributor(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Distributor deleted successfully",
        });
        fetchDistributors();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to delete distributor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleVerifyStatus = async (status: VerificationStatus, remarks?: string) => {
    if (!verifyingDistributor) return;
    
    setIsVerifying(true);
    try {
      const response = await api.adminVerifyDistributor(verifyingDistributor.id, {
        status,
        remarks,
        dealer_code: dealerCode,
      });

      if (response.success) {
        toast({
          title: "Success",
          description: `Distributor ${status === 'APPROVED' ? 'verified' : 'rejected'} successfully`,
        });
        setVerificationDialogOpen(false);
        setVerifyingDistributor(null);
        fetchDistributors();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to verify distributor",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setIsVerifying(false);
  };

  const openVerificationDialog = async (dist: Distributor) => {
    setVerifyingDistributor(dist);
    setDealerCode(dist.dealer_code || "");
    setReviewRemarks("");
    setVerificationDialogOpen(true);
    setIsVerificationDetailLoading(true);

    try {
      const response = await api.getAdminDistributor(dist.id);
      if (response.success && response.data) {
        setVerifyingDistributor(response.data);
        setDealerCode(response.data.dealer_code || dist.dealer_code || "");
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to load distributor details",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load distributor details",
        variant: "destructive",
      });
    } finally {
      setIsVerificationDetailLoading(false);
    }
  };

  const verificationMapLink = getMapLink(verifyingDistributor);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Distributors Management</h1>
          <p className="text-muted-foreground">Manage all authorized distributors.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Distributor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search distributors..."
                value={searchQuery}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending Verification</SelectItem>
                <SelectItem value="APPROVED">Verified Only</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Distributors Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DISTRIBUTOR NAME</TableHead>
                  <TableHead>PHONE</TableHead>
                  <TableHead>AREA/PINCODE</TableHead>
                  <TableHead>VERIFICATION</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributors.length > 0 ? (
                  filteredDistributors.map((dist) => (
                    <TableRow key={dist.id} className={dist.has_profile_changes ? "bg-amber-50/40" : undefined}>
                      <TableCell>
                        <div className="font-medium">{dist.name}</div>
                        {dist.owner_name && (
                          <div className="text-sm text-muted-foreground">{dist.owner_name}</div>
                        )}
                      </TableCell>
                      <TableCell>{dist.phone || "-"}</TableCell>
                      <TableCell>
                        {dist.city || dist.address ? `${dist.city || dist.address}${dist.pincode ? ` / ${dist.pincode}` : ""}` : dist.pincode || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            dist.verification_status === "APPROVED" 
                              ? "success" 
                              : dist.verification_status === "REJECTED" 
                                ? "destructive" 
                                : "warning"
                          }
                        >
                          {dist.verification_status || "PENDING"}
                        </Badge>
                        {dist.dealer_code && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Code: {dist.dealer_code}
                          </div>
                        )}
                        {dist.has_profile_changes ? (
                          <div className="mt-2">
                            <Badge variant="warning">
                              Profile Updated
                            </Badge>
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={dist.is_active ? "success" : "secondary"}
                        >
                          {dist.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {dist.verification_status === "APPROVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="View Agreement"
                              onClick={() => {
                                setViewingAgreementId(dist.id);
                                setAgreementViewerOpen(true);
                              }}
                            >
                              <FileSignature className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDistributor(dist)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openVerificationDialog(dist)}
                          >
                            {dist.verification_status === "APPROVED" ? "Review" : "Verify"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteDistributor(dist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No distributors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredDistributors.length} of {total}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            &lt;
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              className={page === p ? "bg-primary text-white" : ""}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            &gt;
          </Button>
        </div>
      </div>

      {/* Add Distributor Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Distributor</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Business Name *</Label>
              <Input
                placeholder="Business name"
                className="mt-1"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Business Contact Number *</Label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>WhatsApp Number</Label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>
            <div>
              <Label>Business Email</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                className="mt-1"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Pick Location on Map
              </Label>
              <LocationPicker
                onLocationSelect={(loc) => {
                  setFormData(prev => ({
                    ...prev,
                    address_street: loc.address,
                    city: loc.city,
                    state: loc.state,
                    pincode: loc.pincode,
                    latitude: loc.lat.toString(),
                    longitude: loc.lng.toString(),
                  }));
                }}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Street Address *</Label>
              <Input
                placeholder="Business street address"
                className="mt-1"
                value={formData.address_street}
                onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
              />
            </div>
            <div>
              <Label>Area / Locality</Label>
              <Input
                placeholder="Area or locality"
                className="mt-1"
                value={formData.address_area}
                onChange={(e) => setFormData({ ...formData, address_area: e.target.value })}
              />
            </div>
            <div>
              <Label>City *</Label>
              <Input
                placeholder="City name"
                className="mt-1"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label>State *</Label>
              <Input
                placeholder="State name"
                className="mt-1"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <Label>Pincode *</Label>
              <Input
                placeholder="6-digit pincode"
                className="mt-1"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              />
            </div>
            <div>
              <Label>Latitude</Label>
              <Input
                placeholder="e.g., 19.0760"
                className="mt-1"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                placeholder="e.g., 72.8777"
                className="mt-1"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDistributor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              Add Distributor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Distributor Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(o) => {
          setEditDialogOpen(o);
          if (!o) {
            setIsEditDetailLoading(false);
            resetForm();
          }
        }}
      >
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Distributor</DialogTitle>
          </DialogHeader>
          {isEditDetailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : editingDistributor ? (
            <div className="space-y-6 py-2">
              <ProfileChangesSummary changes={editingDistributor.profile_changes} />

              <div className="rounded-3xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          editingDistributor.verification_status === "APPROVED"
                            ? "success"
                            : editingDistributor.verification_status === "REJECTED"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {editingDistributor.verification_status || "PENDING"}
                      </Badge>
                      <Badge variant="info">Update Distributor Profile</Badge>
                      {formData.dealer_code ? (
                        <Badge variant="secondary">Dealer Code: {formData.dealer_code}</Badge>
                      ) : null}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {formData.business_name || editingDistributor.business_name || editingDistributor.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        Submitted on{" "}
                        {new Date(editingDistributor.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="max-w-2xl text-sm text-slate-300">
                      Review distributor details and update missing business, address, banking,
                      and compliance information from this panel.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Owner</p>
                        <p className="mt-2 font-semibold">
                          {displayValue(editingDistributor.owner_name || editingDistributor.name)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Contact</p>
                        <p className="mt-2 font-semibold">
                          {displayValue(formData.phone || editingDistributor.phone)}
                        </p>
                      </div>
                    </div>
                    {editingDistributor.verification_status === "APPROVED" && (
                      <Button
                        variant="secondary"
                        className="w-full bg-white/10 text-white hover:bg-white/20 border-white/10"
                        onClick={() => {
                          setViewingAgreementId(editingDistributor.id);
                          setAgreementViewerOpen(true);
                        }}
                      >
                        <FileSignature className="mr-2 h-4 w-4 text-emerald-400" />
                        View Signed Agreement
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Owner Profile</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem
                        label="Full Name"
                        value={editingDistributor.owner_name || editingDistributor.name}
                      />
                      <DetailItem
                        label="Registered Mobile"
                        value={editingDistributor.owner_phone || editingDistributor.phone}
                      />
                      <DetailItem
                        label="Email Address"
                        value={editingDistributor.owner_email || editingDistributor.email}
                      />
                      <DetailItem
                        label="Verification Status"
                        value={editingDistributor.verification_status}
                      />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Owner details are shown for reference. Use the editable business sections to
                      complete missing distributor information for legacy and self-onboarded records.
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Business Profile</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label>Business Name *</Label>
                        <Input
                          className="mt-1"
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Business Contact Number *</Label>
                        <Input
                          className="mt-1"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>WhatsApp Number</Label>
                        <Input
                          className="mt-1"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Business Email</Label>
                        <Input
                          type="email"
                          className="mt-1"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Business Volume</Label>
                        <Input
                          className="mt-1"
                          placeholder="e.g. 10 - 25 Lakhs"
                          value={formData.expected_business_volume}
                          onChange={(e) =>
                            setFormData({ ...formData, expected_business_volume: e.target.value })
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Dealer Code</Label>
                        <Input
                          className="mt-1"
                          value={formData.dealer_code}
                          onChange={(e) =>
                            setFormData({ ...formData, dealer_code: e.target.value.toUpperCase() })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Business Address</h3>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Pick Location on Map
                    </Label>
                    <LocationPicker
                      initialLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                      initialLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                      onLocationSelect={(loc) => {
                        setFormData((prev) => ({
                          ...prev,
                          address_street: loc.address,
                          city: loc.city,
                          state: loc.state,
                          pincode: loc.pincode,
                          latitude: loc.lat.toString(),
                          longitude: loc.lng.toString(),
                        }));
                      }}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Street Address *</Label>
                      <Input
                        className="mt-1"
                        value={formData.address_street}
                        onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Area / Locality</Label>
                      <Input
                        className="mt-1"
                        value={formData.address_area}
                        onChange={(e) => setFormData({ ...formData, address_area: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input
                        className="mt-1"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <Input
                        className="mt-1"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Pincode *</Label>
                      <Input
                        className="mt-1"
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Latitude</Label>
                      <Input
                        className="mt-1"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Longitude</Label>
                      <Input
                        className="mt-1"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                  </div>
                  {formData.latitude && formData.longitude ? (
                    <div className="pt-2">
                      <a
                        href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        Open location in Google Maps
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Bank & Deposit</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Cheque Number</Label>
                        <Input
                          className="mt-1"
                          value={formData.security_deposit_check_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              security_deposit_check_number: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Bank Name</Label>
                        <Input
                          className="mt-1"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <FileBadge2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Verification Numbers</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Aadhaar Number</Label>
                        <Input
                          className="mt-1"
                          value={formData.aadhaar_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Business PAN Number</Label>
                        <Input
                          className="mt-1"
                          value={formData.pan_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pan_number: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>License Number</Label>
                        <Input
                          className="mt-1"
                          value={formData.license_number}
                          onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>GST Number</Label>
                        <Input
                          className="mt-1"
                          value={formData.gst_number}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gst_number: e.target.value.toUpperCase(),
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center gap-2">
                    <FileBadge2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Verification Documents</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <EditableDocumentCard
                      title="Aadhaar Front"
                      subtitle={displayValue(editingDistributor.aadhaar_number)}
                      url={getAadhaarFrontUrl(editingDistributor)}
                      file={documentFiles.aadhaar_front_photo}
                      inputId="edit-aadhaar-front"
                      onFileSelect={(file) =>
                        setDocumentFiles((prev) => ({ ...prev, aadhaar_front_photo: file }))
                      }
                    />
                    <EditableDocumentCard
                      title="Aadhaar Back"
                      subtitle={displayValue(editingDistributor.aadhaar_number)}
                      url={editingDistributor.aadhaar_back_photo_url}
                      file={documentFiles.aadhaar_back_photo}
                      inputId="edit-aadhaar-back"
                      onFileSelect={(file) =>
                        setDocumentFiles((prev) => ({ ...prev, aadhaar_back_photo: file }))
                      }
                    />
                    <EditableDocumentCard
                      title="Business PAN"
                      subtitle={displayValue(editingDistributor.pan_number)}
                      url={editingDistributor.pan_photo_url}
                      file={documentFiles.pan_photo}
                      inputId="edit-pan"
                      onFileSelect={(file) =>
                        setDocumentFiles((prev) => ({ ...prev, pan_photo: file }))
                      }
                    />
                    <EditableDocumentCard
                      title="Seed / Fertilizer License"
                      subtitle={displayValue(editingDistributor.license_number)}
                      url={editingDistributor.license_photo_url}
                      file={documentFiles.license_photo}
                      inputId="edit-license"
                      onFileSelect={(file) =>
                        setDocumentFiles((prev) => ({ ...prev, license_photo: file }))
                      }
                    />
                    <EditableDocumentCard
                      title="GST Certificate"
                      subtitle={displayValue(editingDistributor.gst_number)}
                      url={editingDistributor.gst_photo_url}
                      file={documentFiles.gst_photo}
                      inputId="edit-gst"
                      onFileSelect={(file) =>
                        setDocumentFiles((prev) => ({ ...prev, gst_photo: file }))
                      }
                    />
                    <EditableDocumentCard
                      title="Security Deposit Cheque"
                      subtitle={displayValue(editingDistributor.security_deposit_check_number)}
                      url={editingDistributor.security_deposit_check_photo}
                      file={documentFiles.check_photo}
                      inputId="edit-check"
                      onFileSelect={(file) =>
                        setDocumentFiles((prev) => ({ ...prev, check_photo: file }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDistributor} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Distributor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onOpenChange={(open) => {
          setVerificationDialogOpen(open);
          if (!open) {
            setVerifyingDistributor(null);
            setDealerCode("");
            setReviewRemarks("");
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Distributor Onboarding</DialogTitle>
          </DialogHeader>
          {isVerificationDetailLoading && !verifyingDistributor ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : verifyingDistributor ? (
            <div className="space-y-6 py-2">
              <ProfileChangesSummary changes={verifyingDistributor.profile_changes} />

              <div className="rounded-3xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          verifyingDistributor.verification_status === "APPROVED"
                            ? "success"
                            : verifyingDistributor.verification_status === "REJECTED"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {verifyingDistributor.verification_status}
                      </Badge>
                      {verifyingDistributor.dealer_code ? (
                        <Badge variant="info">
                          Dealer Code: {verifyingDistributor.dealer_code}
                        </Badge>
                      ) : null}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {verifyingDistributor.business_name || verifyingDistributor.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        Submitted on {new Date(verifyingDistributor.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="max-w-2xl text-sm text-slate-300">
                      Review dealer onboarding details, inspect the submitted compliance documents,
                      and take an approval decision from this panel.
                    </p>
                  </div>
                  <div className="grid min-w-[240px] grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Owner</p>
                      <p className="mt-2 font-semibold">{displayValue(verifyingDistributor.owner_name)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Contact</p>
                      <p className="mt-2 font-semibold">{displayValue(verifyingDistributor.phone)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Owner Profile</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem label="Full Name" value={verifyingDistributor.owner_name} />
                      <DetailItem
                        label="Registered Mobile"
                        value={verifyingDistributor.owner_phone || verifyingDistributor.phone}
                      />
                      <DetailItem
                        label="Email Address"
                        value={verifyingDistributor.owner_email || verifyingDistributor.email}
                      />
                      <DetailItem label="Verification Status" value={verifyingDistributor.verification_status} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Business Profile</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem label="Business Name" value={verifyingDistributor.business_name || verifyingDistributor.name} />
                      <DetailItem label="Business Volume" value={verifyingDistributor.expected_business_volume} />
                      <DetailItem
                        label="Business Contact"
                        value={verifyingDistributor.phone}
                        change={verificationProfileChangeMap.get("phone")}
                      />
                      {hasValue(verifyingDistributor.email) ? (
                        <DetailItem
                          label="Business Email"
                          value={verifyingDistributor.email}
                          change={verificationProfileChangeMap.get("email")}
                        />
                      ) : null}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Business Address</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem
                        label="Street Address"
                        value={verifyingDistributor.address_street || verifyingDistributor.address}
                        change={verificationProfileChangeMap.get("address_street")}
                      />
                      {hasValue(verifyingDistributor.address_area) ? (
                        <DetailItem
                          label="Area / Locality"
                          value={verifyingDistributor.address_area}
                          change={verificationProfileChangeMap.get("address_area")}
                        />
                      ) : null}
                      <DetailItem
                        label="City"
                        value={verifyingDistributor.address_city || verifyingDistributor.city}
                        change={verificationProfileChangeMap.get("address_city")}
                      />
                      <DetailItem
                        label="State"
                        value={verifyingDistributor.address_state || verifyingDistributor.state}
                        change={verificationProfileChangeMap.get("address_state")}
                      />
                      <DetailItem
                        label="Pincode"
                        value={verifyingDistributor.address_pincode || verifyingDistributor.pincode}
                        mono
                        change={verificationProfileChangeMap.get("address_pincode")}
                      />
                      <DetailItem
                        label="Coordinates"
                        value={
                          verifyingDistributor.latitude && verifyingDistributor.longitude
                            ? `${verifyingDistributor.latitude}, ${verifyingDistributor.longitude}`
                            : "N/A"
                        }
                        mono
                        change={verificationProfileChangeMap.get("coordinates")}
                      />
                    </div>
                    {verificationMapLink ? (
                      <div className="pt-2">
                        <a
                          href={verificationMapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          Open location in Google Maps
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Bank & Deposit</h3>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem label="Cheque Number" value={verifyingDistributor.security_deposit_check_number} mono />
                      <DetailItem label="Bank Name" value={verifyingDistributor.bank_name} />
                      <DetailItem label="Dealer Code" value={verifyingDistributor.dealer_code} mono />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center gap-2">
                    <FileBadge2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Verification Documents</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <DocumentCard
                      title="Aadhaar Front"
                      subtitle={displayValue(verifyingDistributor.aadhaar_number)}
                      url={getAadhaarFrontUrl(verifyingDistributor)}
                    />
                    <DocumentCard
                      title="Aadhaar Back"
                      subtitle={displayValue(verifyingDistributor.aadhaar_number)}
                      url={verifyingDistributor.aadhaar_back_photo_url}
                    />
                    <DocumentCard
                      title="Business PAN"
                      subtitle={displayValue(verifyingDistributor.pan_number)}
                      url={verifyingDistributor.pan_photo_url}
                    />
                    <DocumentCard
                      title="Seed / Fertilizer License"
                      subtitle={displayValue(verifyingDistributor.license_number)}
                      url={verifyingDistributor.license_photo_url}
                    />
                    <DocumentCard
                      title="GST Certificate"
                      subtitle={displayValue(verifyingDistributor.gst_number)}
                      url={verifyingDistributor.gst_photo_url}
                    />
                    <DocumentCard
                      title="Security Deposit Cheque"
                      subtitle={displayValue(verifyingDistributor.security_deposit_check_number)}
                      url={verifyingDistributor.security_deposit_check_photo}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Review Decision</h3>
                  </div>
                  <div className="grid gap-5 lg:grid-cols-[1fr,1fr]">
                    <div className="space-y-2">
                      <Label htmlFor="dealer-code">Dealer Code</Label>
                      <Input
                        id="dealer-code"
                        placeholder="AGRIO-HR-001"
                        value={dealerCode}
                        onChange={(e) => setDealerCode(e.target.value.toUpperCase())}
                        disabled={verifyingDistributor.verification_status === "APPROVED"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Required when approving a distributor request.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="review-remarks">Review Notes</Label>
                      <Textarea
                        id="review-remarks"
                        placeholder="Add internal remarks for this decision"
                        value={reviewRemarks}
                        onChange={(e) => setReviewRemarks(e.target.value)}
                        className="min-h-[96px]"
                        disabled={verifyingDistributor.verification_status === "APPROVED"}
                      />
                    </div>
                  </div>
                  {verifyingDistributor.verification_status === "APPROVED" ? (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                      This dealer has already been approved. You can review the submitted details here.
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {verifyingDistributor?.owner_email ? (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {verifyingDistributor.owner_email}
                </span>
              ) : null}
              {verifyingDistributor?.phone ? (
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {verifyingDistributor.phone}
                </span>
              ) : null}
            </div>
            {verifyingDistributor && verifyingDistributor.verification_status !== "APPROVED" ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                  disabled={isVerifying}
                  onClick={() => handleVerifyStatus("REJECTED" as VerificationStatus, reviewRemarks.trim() || undefined)}
                >
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject Request
                </Button>
                <Button
                  disabled={isVerifying || !dealerCode.trim()}
                  onClick={() => handleVerifyStatus("APPROVED" as VerificationStatus, reviewRemarks.trim() || undefined)}
                >
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Approve Dealer
                </Button>
              </div>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AgreementViewer
        isOpen={agreementViewerOpen}
        onClose={() => {
          setAgreementViewerOpen(false);
          setViewingAgreementId(null);
        }}
        distributorId={viewingAgreementId || undefined}
        businessName={
          editingDistributor?.business_name || 
          verifyingDistributor?.business_name ||
          "Dealer Agreement"
        }
        dealerCode={editingDistributor?.dealer_code || verifyingDistributor?.dealer_code}
      />
    </div>
  );
}

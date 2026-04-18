"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  ExternalLink,
  FileBadge2,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  XCircle,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgreementViewer } from "@/components/distributors/AgreementViewer";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/lib/api";
import type { Distributor, VerificationStatus } from "@/lib/api";

function getVerificationBadgeVariant(status?: VerificationStatus) {
  switch (status) {
    case "APPROVED":
      return "success" as const;
    case "REJECTED":
      return "destructive" as const;
    default:
      return "warning" as const;
  }
}

function formatDate(date?: string) {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className={mono ? "font-mono text-sm text-slate-900" : "text-sm font-medium text-slate-900"}>
        {value ?? <span className="text-slate-400">Not provided</span>}
      </div>
    </div>
  );
}

export default function DistributorRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Distributor | null>(null);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<Distributor | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [dealerCode, setDealerCode] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [agreementViewerOpen, setAgreementViewerOpen] = useState(false);
  const [viewingAgreementId, setViewingAgreementId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminDistributors({
        page,
        limit: 10,
        q: appliedSearchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        requestOnly: true,
      });

      if (response.success && response.data) {
        setRequests(response.data.distributors || []);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
          setTotal(response.data.pagination.total);
        }
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch distributor requests:", error);
      toast({
        title: "Error",
        description: "Unable to load distributor requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [appliedSearchQuery, page, statusFilter, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearchQuery(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const visibleStats = useMemo(() => {
    return {
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
    };
  }, [stats]);

  const activeRequest = selectedRequestDetail || selectedRequest;
  const mapLink = getMapLink(activeRequest);

  const openDetails = async (request: Distributor) => {
    setSelectedRequest(request);
    setSelectedRequestDetail(null);
    setDealerCode(request.dealer_code || "");
    setReviewRemarks("");
    setDetailsOpen(true);
    setIsDetailLoading(true);

    try {
      const response = await api.getAdminDistributor(request.id);
      if (response.success && response.data) {
        setSelectedRequestDetail(response.data);
        setDealerCode(response.data.dealer_code || request.dealer_code || "");
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
      setIsDetailLoading(false);
    }
  };

  const handleReviewAction = async (status: VerificationStatus) => {
    if (!activeRequest) return;

    setIsSubmittingReview(true);
    try {
      const response = await api.adminVerifyDistributor(activeRequest.id, {
        status,
        dealer_code: dealerCode.trim() || undefined,
        remarks: reviewRemarks.trim() || undefined,
      });

      if (response.success) {
        toast({
          title: status === "APPROVED" ? "Dealer approved" : "Request rejected",
          description:
            status === "APPROVED"
              ? "Dealer request approved successfully."
              : "Dealer request rejected successfully.",
        });
        setDetailsOpen(false);
        setSelectedRequest(null);
        setSelectedRequestDetail(null);
        await fetchRequests();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || "Failed to update request status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while updating the request",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Distributor Requests</h1>
          <p className="text-muted-foreground">
            Review onboarding submissions, inspect compliance documents, and approve dealer activation.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Card
            className={`min-w-[120px] cursor-pointer transition-all duration-200 border-yellow-200 bg-yellow-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              statusFilter === "PENDING" ? "ring-2 ring-yellow-400 ring-offset-2" : ""
            }`}
            onClick={() => {
              setStatusFilter("PENDING");
              setPage(1);
            }}
          >
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-yellow-700">Pending</p>
              <p className="mt-2 text-2xl font-bold text-yellow-900">{visibleStats.pending}</p>
            </CardContent>
          </Card>
          <Card
            className={`min-w-[120px] cursor-pointer transition-all duration-200 border-green-200 bg-green-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              statusFilter === "APPROVED" ? "ring-2 ring-green-400 ring-offset-2" : ""
            }`}
            onClick={() => {
              setStatusFilter("APPROVED");
              setPage(1);
            }}
          >
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-green-700">Approved</p>
              <p className="mt-2 text-2xl font-bold text-green-900">{visibleStats.approved}</p>
            </CardContent>
          </Card>
          <Card
            className={`min-w-[120px] cursor-pointer transition-all duration-200 border-red-200 bg-red-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${
              statusFilter === "REJECTED" ? "ring-2 ring-red-400 ring-offset-2" : ""
            }`}
            onClick={() => {
              setStatusFilter("REJECTED");
              setPage(1);
            }}
          >
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-red-700">Rejected</p>
              <p className="mt-2 text-2xl font-bold text-red-900">{visibleStats.rejected}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by business name, owner, phone or dealer code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending requests</SelectItem>
                <SelectItem value="REJECTED">Rejected requests</SelectItem>
                <SelectItem value="APPROVED">Approved dealers</SelectItem>
                <SelectItem value="all">All requests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-12 col-span-2" />
                  <Skeleton className="h-12 col-span-1" />
                  <Skeleton className="h-12 col-span-1" />
                  <Skeleton className="h-12 col-span-1" />
                  <Skeleton className="h-12 col-span-1" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BUSINESS</TableHead>
                  <TableHead>OWNER</TableHead>
                  <TableHead>CONTACT</TableHead>
                  <TableHead>SUBMITTED</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {request.business_name || request.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {displayValue(request.city)}
                            {request.pincode ? ` • ${request.pincode}` : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {displayValue(request.owner_name)}
                          </p>
                          {hasValue(request.owner_email) ? (
                            <p className="text-xs text-muted-foreground">
                              {request.owner_email}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">
                            {displayValue(request.phone)}
                          </p>
                          {hasValue(request.email) ? (
                            <p className="text-xs text-muted-foreground">
                              {request.email}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(request.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={getVerificationBadgeVariant(request.verification_status)}>
                          {request.verification_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {request.verification_status === "APPROVED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-emerald-700 hover:text-emerald-800 border-emerald-100 hover:bg-emerald-50"
                              onClick={() => {
                                setViewingAgreementId(request.id);
                                setAgreementViewerOpen(true);
                              }}
                            >
                              <FileSignature className="mr-2 h-4 w-4" />
                              Agreement
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetails(request)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="mx-auto max-w-md space-y-2">
                        <p className="text-lg font-semibold text-slate-900">
                          No distributor requests found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try a different search term or switch the request status filter.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {requests.length} of {total} requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <div className="rounded-md border px-3 py-2 text-sm font-medium">
            Page {page} of {Math.max(totalPages, 1)}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog
        open={detailsOpen}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedRequest(null);
            setSelectedRequestDetail(null);
            setDealerCode("");
            setReviewRemarks("");
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Distributor Request Details</DialogTitle>
          </DialogHeader>

          {isDetailLoading && !activeRequest ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : activeRequest ? (
            <div className="space-y-6 py-2">
              <div className="rounded-3xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getVerificationBadgeVariant(activeRequest.verification_status)}>
                        {activeRequest.verification_status}
                      </Badge>
                      {activeRequest.dealer_code ? (
                        <Badge variant="info">Dealer Code: {activeRequest.dealer_code}</Badge>
                      ) : null}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {activeRequest.business_name || activeRequest.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        Submitted on {formatDate(activeRequest.created_at)}
                      </p>
                    </div>
                    <p className="max-w-2xl text-sm text-slate-300">
                      Review dealer onboarding details, inspect the submitted compliance documents,
                      and take an approval decision from this panel.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Owner</p>
                        <p className="mt-2 font-semibold font-mono text-sm leading-tight">{displayValue(activeRequest.owner_name)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Contact</p>
                        <p className="mt-2 font-semibold font-mono text-sm leading-tight">{displayValue(activeRequest.phone)}</p>
                      </div>
                    </div>
                    {activeRequest.verification_status === "APPROVED" && (
                      <Button
                        variant="secondary"
                        className="w-full bg-white/10 text-white hover:bg-white/20 border-white/10"
                        onClick={() => {
                          setViewingAgreementId(activeRequest.id);
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
                      <h3 className="text-lg font-semibold">Identity Profile</h3>
                    </div>
                    {activeRequest.owner_photo_url && (
                      <div className="mb-4 aspect-square max-w-[120px] overflow-hidden rounded-2xl border-2 border-primary/20 ring-4 ring-primary/5">
                        <Image
                          src={activeRequest.owner_photo_url}
                          alt="Identity Snap"
                          width={120}
                          height={120}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailItem label="Full Name" value={activeRequest.owner_name} />
                      <DetailItem label="Registered Mobile" value={activeRequest.owner_phone || activeRequest.phone} />
                      <DetailItem label="Email Address" value={activeRequest.owner_email || activeRequest.email} />
                      <DetailItem label="Verification Status" value={activeRequest.verification_status} />
                      {(activeRequest as any).onboarding_lat && (activeRequest as any).onboarding_lng && (
                        <DetailItem 
                          label="Snapshot Location" 
                          value={
                            <a 
                              href={`https://www.google.com/maps?q=${(activeRequest as any).onboarding_lat},${(activeRequest as any).onboarding_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary hover:underline hover:text-emerald-700 font-bold"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              View on Google Maps
                            </a>
                          }
                        />
                      )}
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
                      <DetailItem label="Business Name" value={activeRequest.business_name || activeRequest.name} />
                      <DetailItem label="Business Volume" value={activeRequest.expected_business_volume} />
                      <DetailItem label="Business Contact" value={activeRequest.phone} />
                      {hasValue(activeRequest.email) ? (
                        <DetailItem label="Business Email" value={activeRequest.email} />
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
                      <DetailItem label="Street Address" value={activeRequest.address_street || activeRequest.address} />
                      {hasValue(activeRequest.address_area) ? (
                        <DetailItem label="Area / Locality" value={activeRequest.address_area} />
                      ) : null}
                      <DetailItem label="City" value={activeRequest.address_city || activeRequest.city} />
                      <DetailItem label="State" value={activeRequest.address_state || activeRequest.state} />
                      <DetailItem label="Pincode" value={activeRequest.address_pincode || activeRequest.pincode} mono />
                      <DetailItem
                        label="Store Coordinates"
                        value={
                          activeRequest.latitude && activeRequest.longitude
                            ? `${activeRequest.latitude}, ${activeRequest.longitude}`
                            : "N/A"
                        }
                        mono
                      />
                      {activeRequest.onboarding_lat && activeRequest.onboarding_lng && (
                        <div className="col-span-full rounded-2xl bg-emerald-50/50 p-3 border border-emerald-100 mt-2">
                          <DetailItem
                            label="Onboarding Geofence (Verified)"
                            value={`${activeRequest.onboarding_lat}, ${activeRequest.onboarding_lng}`}
                            mono
                          />
                          <a
                            href={`https://www.google.com/maps?q=${activeRequest.onboarding_lat},${activeRequest.onboarding_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 hover:underline"
                          >
                            Verify Registration Location <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                    {mapLink ? (
                      <div className="pt-2">
                        <a
                          href={mapLink}
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
                      <DetailItem label="Cheque 1 Number" value={activeRequest.security_deposit_check_number} mono />
                      <DetailItem label="Cheque 1 Bank" value={activeRequest.bank_name} />
                      {hasValue(activeRequest.security_deposit_check_number2) && (
                        <>
                          <DetailItem label="Cheque 2 Number" value={activeRequest.security_deposit_check_number2} mono />
                          <DetailItem label="Cheque 2 Bank" value={activeRequest.bank_name2} />
                        </>
                      )}
                      {activeRequest.is_bank_verified && (
                        <>
                          <DetailItem label="Verified Acc No." value={activeRequest.bank_account_number} mono />
                          <DetailItem label="Verified IFSC" value={activeRequest.bank_ifsc_code} mono />
                          <DetailItem label="Account Holder" value={activeRequest.bank_account_holder_name} />
                          <DetailItem label="Verified Bank" value={activeRequest.actual_bank_name} />
                        </>
                      )}
                      <DetailItem label="Dealer Code" value={activeRequest.dealer_code} mono />
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
                      title="Live Identity Snapshot"
                      subtitle="Mandatory identity snapshot"
                      url={activeRequest.owner_photo_url}
                    />
                    <DocumentCard
                      title="Aadhaar Front"
                      subtitle={displayValue(activeRequest.aadhaar_number)}
                      url={getAadhaarFrontUrl(activeRequest)}
                    />
                    <DocumentCard
                      title="Aadhaar Back"
                      subtitle={displayValue(activeRequest.aadhaar_number)}
                      url={activeRequest.aadhaar_back_photo_url}
                    />
                    <DocumentCard
                      title="Individual PAN"
                      subtitle={displayValue(activeRequest.pan_number)}
                      url={activeRequest.pan_photo_url}
                    />
                    <DocumentCard
                      title="Seed / Fertilizer License"
                      subtitle={displayValue(activeRequest.license_number)}
                      url={activeRequest.license_photo_url}
                    />
                    <DocumentCard
                      title="GST Certificate"
                      subtitle={displayValue(activeRequest.gst_number)}
                      url={activeRequest.gst_photo_url}
                    />
                    <DocumentCard
                      title="Cheque 1 Photo"
                      subtitle={displayValue(activeRequest.security_deposit_check_number)}
                      url={activeRequest.security_deposit_check_photo}
                    />
                    {hasValue(activeRequest.security_deposit_check_photo2) && (
                      <DocumentCard
                        title="Cheque 2 Photo"
                        subtitle={displayValue(activeRequest.security_deposit_check_number2)}
                        url={activeRequest.security_deposit_check_photo2}
                      />
                    )}
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
                        placeholder="Auto-generated on approval, or enter a custom override"
                        value={dealerCode}
                        onChange={(e) => setDealerCode(e.target.value.toUpperCase())}
                        disabled={activeRequest.verification_status === "APPROVED"}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to auto-generate a unique location-based dealer code.
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
                        disabled={activeRequest.verification_status === "APPROVED"}
                      />
                    </div>
                  </div>
                  {activeRequest.verification_status === "APPROVED" ? (
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
              {activeRequest?.owner_email ? (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {activeRequest.owner_email}
                </span>
              ) : null}
              {activeRequest?.phone ? (
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {activeRequest.phone}
                </span>
              ) : null}
            </div>
            {activeRequest && activeRequest.verification_status !== "APPROVED" ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction("REJECTED")}
                >
                  {isSubmittingReview ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject Request
                </Button>
                <Button
                  disabled={isSubmittingReview}
                  onClick={() => handleReviewAction("APPROVED")}
                >
                  {isSubmittingReview ? (
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

      {/* Agreement Viewer */}
      <AgreementViewer
        isOpen={agreementViewerOpen}
        onClose={() => {
          setAgreementViewerOpen(false);
          setViewingAgreementId(null);
        }}
        distributorId={viewingAgreementId || undefined}
        businessName={
          activeRequest?.business_name || 
          activeRequest?.name || 
          "Dealer Agreement"
        }
        dealerCode={activeRequest?.dealer_code}
      />
    </div>
  );
}

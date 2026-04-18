"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Loader2,
  MapPin,
  ShieldCheck,
  Upload,
  Camera,
} from "lucide-react";
import LocationPicker from "@/components/LocationPicker";
import CameraCapture from "@/components/CameraCapture";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/store/useStore";
import * as api from "@/lib/api";

const DRAFT_KEY = "agrio-web-dealer-onboarding-draft-v2";

type StepKey = 1 | 2 | 3 | 4;
type DocKey =
  | "aadhaar_front_photo"
  | "aadhaar_back_photo"
  | "pan_photo"
  | "license_photo"
  | "gst_photo"
  | "check_photo"
  | "check_photo_2"
  | "owner_photo";

type FormState = {
  business_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  expected_business_volume: string;
  address_street: string;
  address_area: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
  latitude: string;
  longitude: string;
  aadhaar_number: string;
  pan_number: string;
  license_number: string;
  gst_number: string;
  bank_name: string;
  check_number: string;
  bank_name_2: string;
  check_number_2: string;
  bank_account_number: string;
  bank_ifsc_code: string;
  bank_account_holder_name: string;
  bank_actual_name: string;
  onboarding_lat: string;
  onboarding_lng: string;
};

type DraftState = {
  step: StepKey;
  form: FormState;
  useSamePhone: boolean;
  useSameEmail: boolean;
  panVerifiedValue: string | null;
  gstVerifiedValue: string | null;
  aadhaarVerifiedValue: string | null;
  aadhaarVerificationId: string | null;
  bankVerifiedValue: string | null;
  verifiedBankName: string | null;
  verifiedBankHolder: string | null;
};

const emptyForm: FormState = {
  business_name: "",
  phone: "",
  whatsapp: "",
      email: "",
      expected_business_volume: "",
  address_street: "",
  address_area: "",
  address_city: "",
  address_state: "",
  address_pincode: "",
  latitude: "",
  longitude: "",
  aadhaar_number: "",
  pan_number: "",
  license_number: "",
  gst_number: "",
  bank_name: "",
  check_number: "",
  bank_name_2: "",
  check_number_2: "",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_account_holder_name: "",
  bank_actual_name: "",
  onboarding_lat: "",
  onboarding_lng: "",
};

const businessVolumeOptions = [
  "1 - 5 Lakhs",
  "5 - 10 Lakhs",
  "10 - 25 Lakhs",
  "25 - 50 Lakhs",
  "50 Lakhs - 1 Crore",
  "1 Crore +",
];

const LICENSE_NUMBER_REGEX = /^[A-Z0-9/\- ]{5,30}$/;
const CHEQUE_NUMBER_REGEX = /^\d{6}$/;

function normalizePan(value: string) {
  return value.trim().toUpperCase();
}

function normalizeGst(value: string) {
  return value.trim().toUpperCase();
}

function normalizeAadhaar(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeComparableValue(value: unknown) {
  return String(value ?? "").trim();
}

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

function getFileName(url: string | undefined | null) {
  if (!url) return null;
  try {
    return new URL(url).pathname.split("/").pop();
  } catch {
    return url.split("/").pop() ?? null;
  }
}

function DocumentCard({
  label,
  helper,
  file,
  preview,
  existingUrl,
  disabled = false,
  onSelect,
  onClear,
  onCameraClick,
}: {
  label: string;
  helper?: string;
  file: File | null;
  preview: string | null;
  existingUrl?: string | null;
  disabled?: boolean;
  onSelect?: (file: File) => void;
  onClear: () => void;
  onCameraClick?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayPreview = preview || existingUrl || null;

  return (
    <div className="rounded-2xl bg-slate-50/70 p-4">
      <div className="mb-2 text-sm font-semibold text-gray-900">
        {label}
        {label.includes("*") === false && (
          // if asterisk is not in label string, we can pass it via prop if we add one, 
          // but I'll stick to adding it in the label string for simplicity as requested
          null
        )}
      </div>
      {helper ? <div className="mb-3 text-xs text-muted-foreground">{helper}</div> : null}

      <div
        className={`group relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white md:h-52 ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
        onClick={() => {
          if (disabled) return;
          if (onCameraClick) {
            onCameraClick?.();
          } else {
            inputRef.current?.click();
          }
        }}
      >
        {displayPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPreview}
            alt={label}
            className="max-h-full max-w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {onCameraClick ? <Camera className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {onCameraClick ? "Take real-time photo" : "Upload image"}
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          if (onCameraClick) {
            onCameraClick?.();
            return;
          }
          const selected = event.target.files?.[0];
          if (selected) onSelect?.(selected);
          event.currentTarget.value = "";
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="truncate text-xs text-slate-500">
          {file?.name || getFileName(existingUrl) || "No file selected"}
        </div>
        {!disabled && (file || preview) && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default function DistributorOnboardingPage() {
  const { language, user, distributorProfile, setDistributorProfile } = useStore();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [useSamePhone, setUseSamePhone] = useState(false);
  const [useSameEmail, setUseSameEmail] = useState(false);
  const [files, setFiles] = useState<Record<DocKey, File | null>>({
    aadhaar_front_photo: null,
    aadhaar_back_photo: null,
    pan_photo: null,
    license_photo: null,
    gst_photo: null,
    check_photo: null,
    check_photo_2: null,
    owner_photo: null,
  });
  const [previews, setPreviews] = useState<Record<DocKey, string | null>>({
    aadhaar_front_photo: null,
    aadhaar_back_photo: null,
    pan_photo: null,
    license_photo: null,
    gst_photo: null,
    check_photo: null,
    check_photo_2: null,
    owner_photo: null,
  });
  const [panVerifiedValue, setPanVerifiedValue] = useState<string | null>(null);
  const [gstVerifiedValue, setGstVerifiedValue] = useState<string | null>(null);
  const [aadhaarVerifiedValue, setAadhaarVerifiedValue] = useState<string | null>(null);
  const [aadhaarVerificationId, setAadhaarVerificationId] = useState<string | null>(null);
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isVerifyingGst, setIsVerifyingGst] = useState(false);
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState(false);
  const [bankVerifiedValue, setBankVerifiedValue] = useState<string | null>(null);
  const [verifiedBankName, setVerifiedBankName] = useState<string | null>(null);
  const [verifiedBankHolder, setVerifiedBankHolder] = useState<string | null>(null);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const currentPan = normalizePan(form.pan_number);
  const currentGst = normalizeGst(form.gst_number);
  const currentAadhaar = normalizeAadhaar(form.aadhaar_number);

  const isPanVerified = !!panVerifiedValue && panVerifiedValue === currentPan;
  const isGstVerified = true; // GST verification removed
  const isAadhaarVerified = !!aadhaarVerifiedValue && aadhaarVerifiedValue === currentAadhaar;
  const isBankVerified = !!bankVerifiedValue && bankVerifiedValue === form.bank_account_number;
  const isApprovedDealer = distributorProfile?.verification_status === "APPROVED";
  const isPendingDealer = distributorProfile?.verification_status === "PENDING";
  const hasLockedApprovedProfile = isApprovedDealer;
  const backHref = user?.role === "DEALER" ? "/dashboard/dealer" : "/dashboard";
  const step: StepKey = 1;
  const hasApprovedProfileChanges = useMemo(() => {
    if (!hasLockedApprovedProfile) return true;

    return (
      normalizeComparableValue(form.whatsapp) !== normalizeComparableValue(distributorProfile?.whatsapp) ||
      normalizeComparableValue(form.phone) !== normalizeComparableValue(distributorProfile?.phone) ||
      normalizeComparableValue(form.email) !== normalizeComparableValue(distributorProfile?.email) ||
      normalizeComparableValue(form.address_street) !==
        normalizeComparableValue(
          distributorProfile?.address_street ?? distributorProfile?.address ?? user?.full_address,
        ) ||
      normalizeComparableValue(form.address_area) !== normalizeComparableValue(distributorProfile?.address_area) ||
      normalizeComparableValue(form.address_city) !==
        normalizeComparableValue(distributorProfile?.address_city ?? distributorProfile?.city ?? user?.district) ||
      normalizeComparableValue(form.address_state) !==
        normalizeComparableValue(distributorProfile?.address_state ?? distributorProfile?.state ?? user?.state) ||
      normalizeComparableValue(form.address_pincode) !==
        normalizeComparableValue(distributorProfile?.address_pincode ?? distributorProfile?.pincode ?? user?.pin_code) ||
      normalizeComparableValue(form.latitude) !==
        normalizeComparableValue(distributorProfile?.location_lat ?? distributorProfile?.latitude) ||
      normalizeComparableValue(form.longitude) !==
        normalizeComparableValue(distributorProfile?.location_lng ?? distributorProfile?.longitude)
    );
  }, [distributorProfile, form, hasLockedApprovedProfile, user?.district, user?.full_address, user?.pin_code, user?.state]);

  useEffect(() => {
    if (!user) return;

    if (isPendingDealer) {
      router.replace("/dashboard/dealer/review");
      return;
    }
  }, [isPendingDealer, router, user]);

  useEffect(() => {
    const savedDraft = typeof window !== "undefined" ? window.localStorage.getItem(DRAFT_KEY) : null;
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as DraftState;
        setForm((prev) => ({ ...prev, ...parsed.form }));
        setUseSamePhone(parsed.useSamePhone ?? false);
        setUseSameEmail(parsed.useSameEmail ?? false);
        setPanVerifiedValue(parsed.panVerifiedValue);
        setGstVerifiedValue(parsed.gstVerifiedValue);
        setAadhaarVerifiedValue(parsed.aadhaarVerifiedValue);
        setAadhaarVerificationId(parsed.aadhaarVerificationId);
        setBankVerifiedValue(parsed.bankVerifiedValue);
        setVerifiedBankName(parsed.verifiedBankName);
        setVerifiedBankHolder(parsed.verifiedBankHolder);
      } catch {
        // ignore malformed draft
      }
    }
  }, []);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      business_name: prev.business_name || distributorProfile?.business_name || distributorProfile?.name || "",
      phone:
        prev.phone ||
        distributorProfile?.phone ||
        "",
      email:
        prev.email ||
        distributorProfile?.email ||
        "",
      expected_business_volume: prev.expected_business_volume || distributorProfile?.expected_business_volume || "",
      address_street:
        prev.address_street ||
        distributorProfile?.address_street ||
        distributorProfile?.address ||
        user?.full_address ||
        "",
      address_area: prev.address_area || distributorProfile?.address_area || "",
      address_city:
        prev.address_city ||
        distributorProfile?.address_city ||
        distributorProfile?.city ||
        user?.district ||
        "",
      address_state:
        prev.address_state ||
        distributorProfile?.address_state ||
        distributorProfile?.state ||
        user?.state ||
        "",
      address_pincode:
        prev.address_pincode ||
        distributorProfile?.address_pincode ||
        distributorProfile?.pincode ||
        user?.pin_code ||
        "",
      latitude:
        prev.latitude ||
        String(
          distributorProfile?.location_lat ??
            distributorProfile?.latitude ??
            "",
        ),
      longitude:
        prev.longitude ||
        String(
          distributorProfile?.location_lng ??
            distributorProfile?.longitude ??
            "",
        ),
      aadhaar_number: prev.aadhaar_number || distributorProfile?.aadhaar_number || "",
      pan_number: prev.pan_number || distributorProfile?.pan_number || "",
      license_number: prev.license_number || distributorProfile?.license_number || "",
      gst_number: prev.gst_number || distributorProfile?.gst_number || "",
      bank_name: prev.bank_name || distributorProfile?.bank_name || "",
      check_number: prev.check_number || distributorProfile?.security_deposit_check_number || "",
      bank_name_2: prev.bank_name_2 || distributorProfile?.bank_name2 || "",
      check_number_2: prev.check_number_2 || distributorProfile?.security_deposit_check_number2 || "",
      bank_account_number: prev.bank_account_number || distributorProfile?.bank_account_number || (distributorProfile as any)?.bankAccountNumber || "",
      bank_ifsc_code: prev.bank_ifsc_code || distributorProfile?.bank_ifsc_code || (distributorProfile as any)?.bankIfscCode || "",
    }));
  }, [distributorProfile, user]);

  useEffect(() => {
    if (!distributorProfile) return;

    // Hydrate verification flags from server profile if available
    // Check both camelCase and snake_case as backend might send both
    const serverPanVerified = distributorProfile.is_pan_verified ?? (distributorProfile as any).isPanVerified;
    const serverAadhaarVerified = distributorProfile.is_aadhaar_verified ?? (distributorProfile as any).isAadhaarVerified;

    if (serverPanVerified && distributorProfile.pan_number) {
      setPanVerifiedValue((prev) => prev ?? normalizePan(distributorProfile.pan_number || ""));
    }

    if (serverAadhaarVerified && distributorProfile.aadhaar_number) {
      setAadhaarVerifiedValue((prev) => prev ?? normalizeAadhaar(distributorProfile.aadhaar_number || ""));
    }

    // Existing logic for APPROVED profiles (GST and others)
    if (hasLockedApprovedProfile) {
      if (distributorProfile.gst_number) {
        setGstVerifiedValue((prev) => prev ?? normalizeGst(distributorProfile.gst_number || ""));
      }
    }

    // Bank verification hydration
    const serverBankVerified = distributorProfile.is_bank_verified ?? (distributorProfile as any).isBankVerified;
    const accountNumber = distributorProfile.bank_account_number || (distributorProfile as any).bankAccountNumber;
    
    if (serverBankVerified && accountNumber) {
      setBankVerifiedValue((prev) => prev ?? accountNumber);
      setVerifiedBankName((prev) => prev ?? (distributorProfile.actual_bank_name || (distributorProfile as any).actualBankName || distributorProfile.bank_name || null));
      setVerifiedBankHolder((prev) => prev ?? (distributorProfile.bank_account_holder_name || (distributorProfile as any).bankAccountHolderName || null));
    }
  }, [distributorProfile, hasLockedApprovedProfile]);

  useEffect(() => {
    if (useSamePhone && user?.phone_number) {
      setForm((prev) => ({ ...prev, phone: user.phone_number || "" }));
    }
  }, [useSamePhone, user?.phone_number]);

  useEffect(() => {
    if (useSameEmail) {
      setForm((prev) => ({ ...prev, email: user?.email || "" }));
    }
  }, [useSameEmail, user?.email]);

  // IFSC Auto-fill Bank Name
  useEffect(() => {
    const ifsc = form.bank_ifsc_code?.trim().toUpperCase();
    if (ifsc?.length === 11) {
      const lookupBank = async () => {
        try {
          const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
          if (res.ok) {
            const data = await res.json();
            if (data.BANK && !form.bank_actual_name) {
              updateField("bank_actual_name", data.BANK);
              // Also auto-fill cheque 1 bank name if empty
              if (!form.bank_name) updateField("bank_name", data.BANK);
            }
          }
        } catch (err) {
          console.error("IFSC lookup failed:", err);
        }
      };
      lookupBank();
    }
  }, [form.bank_ifsc_code]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const draft: DraftState = {
      step,
      form,
      useSamePhone,
      useSameEmail,
      panVerifiedValue,
      gstVerifiedValue,
      aadhaarVerifiedValue,
      aadhaarVerificationId,
      bankVerifiedValue,
      verifiedBankName,
      verifiedBankHolder,
    };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [
    aadhaarVerificationId,
    aadhaarVerifiedValue,
    form,
    gstVerifiedValue,
    panVerifiedValue,
    step,
    useSameEmail,
    useSamePhone,
  ]);

  useEffect(() => {
    if (!aadhaarVerificationId || isAadhaarVerified) return;

    const interval = window.setInterval(async () => {
      const response = await api.distributorsApi.getAadhaarVerificationStatus(aadhaarVerificationId);
      if (response.success && response.data?.is_verified) {
        setAadhaarVerifiedValue(currentAadhaar);
        if (distributorProfile) {
          setDistributorProfile({
            ...distributorProfile,
            aadhaar_number: currentAadhaar,
          });
        }
        window.clearInterval(interval);
        toast({
          title: language === "en" ? "Aadhaar Verified" : "आधार सत्यापित",
          description: language === "en"
            ? "Aadhaar verification was completed successfully."
            : "आधार सत्यापन सफलतापूर्वक पूरा हो गया।",
          variant: "success",
        });
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [
    aadhaarVerificationId,
    currentAadhaar,
    distributorProfile,
    isAadhaarVerified,
    language,
    setDistributorProfile,
    toast,
  ]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFile = (key: DocKey, file: File) => {
    if (!isImageFile(file)) {
      toast({
        title: language === "en" ? "Invalid file" : "अमान्य फ़ाइल",
        description: language === "en" ? "Please upload an image file." : "कृपया इमेज फ़ाइल अपलोड करें।",
        variant: "destructive",
      });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setFiles((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => ({ ...prev, [key]: localPreview }));
  };

  const clearFile = (key: DocKey) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    setPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]!);
      return { ...prev, [key]: null };
    });
  };

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((preview) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  const validateStep = (target: StepKey) => {
    if (target === 1) {
      if (!form.business_name.trim()) return language === "en" ? "Business name is required." : "व्यवसाय का नाम आवश्यक है।";
      if (!/^[6-9]\d{9}$/.test(form.phone.trim())) return language === "en" ? "Enter a valid business contact number." : "मान्य बिज़नेस संपर्क नंबर दर्ज करें।";
      if (form.email.trim()) {
        if (!/\S+@\S+\.\S+/.test(form.email.trim())) return language === "en" ? "Enter a valid business email." : "मान्य बिज़नेस ईमेल दर्ज करें।";
      }
      if (!form.expected_business_volume.trim()) return language === "en" ? "Select expected business volume." : "अपेक्षित व्यवसाय मात्रा चुनें।";
      if (!form.address_street.trim() || !form.address_city.trim() || !form.address_state.trim() || !form.address_pincode.trim()) {
        return language === "en" ? "Complete the business address fields." : "व्यवसाय पता फ़ील्ड पूरी करें।";
      }
      if (!form.latitude || !form.longitude) {
        return language === "en" ? "Pick your business location on the map." : "मैप पर व्यवसाय का स्थान चुनें।";
      }
    }

    if (target === 2) {
      if (currentAadhaar.length !== 12) return language === "en" ? "Enter a valid 12-digit Aadhaar number." : "मान्य 12 अंकों का आधार नंबर दर्ज करें।";
      if (!isAadhaarVerified) return language === "en" ? "Please complete Aadhaar verification." : "कृपया आधार सत्यापन पूरा करें।";
      if (!files.aadhaar_front_photo && !distributorProfile?.aadhaar_front_photo_url) {
        return language === "en" ? "Upload Aadhaar front image." : "आधार फ्रंट इमेज अपलोड करें।";
      }
      if (!files.aadhaar_back_photo && !distributorProfile?.aadhaar_back_photo_url) {
        return language === "en" ? "Upload Aadhaar back image." : "आधार बैक इमेज अपलोड करें।";
      }
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(currentPan)) return language === "en" ? "Enter a valid Individual PAN number." : "मान्य व्यक्तिगत पैन नंबर दर्ज करें।";
      if (!isPanVerified) return language === "en" ? "Please verify Individual PAN." : "कृपया व्यक्तिगत पैन सत्यापित करें।";
      if (!files.pan_photo && !distributorProfile?.pan_photo_url) {
        return language === "en" ? "Upload Individual PAN image." : "व्यक्तिगत पैन इमेज अपलोड करें।";
      }
    }

    if (target === 3) {
      if (!form.license_number.trim()) return language === "en" ? "License number is required." : "लाइसेंस नंबर आवश्यक है।";
      if (!LICENSE_NUMBER_REGEX.test(form.license_number.trim())) {
        return language === "en"
          ? "Enter a valid license number using 5-30 letters or digits."
          : "5-30 अक्षरों या अंकों वाला मान्य लाइसेंस नंबर दर्ज करें।";
      }
      if (!files.license_photo && !distributorProfile?.license_photo_url) {
        return language === "en" ? "Upload license image." : "लाइसेंस इमेज अपलोड करें।";
      }
      if (currentGst && currentGst.trim()) {
        if (!/^[0-9A-Z]{2}[0-9A-Z]{10}[0-9A-Z]{3}$/.test(currentGst)) {
          return language === "en" ? "Enter a valid GST number." : "मान्य जीएसटी नंबर दर्ज करें।";
        }
      }
      // GST Verification removed
      if (!files.gst_photo && !distributorProfile?.gst_photo_url) {
        // GST image is now also optional if GST is not provided, 
        // but let's keep it required if GST number is entered.
        if (currentGst && currentGst.trim()) {
           // optional or required? User said "gst optional". 
           // I'll make the whole GST block optional.
        }
      }
    }

    if (target === 4) {
      if (!form.bank_name.trim()) return language === "en" ? "Bank name is required." : "बैंक नाम आवश्यक है।";
      if (!CHEQUE_NUMBER_REGEX.test(form.check_number.trim())) {
        return language === "en" ? "First cheque number must be exactly 6 digits." : "पहला चेक नंबर ठीक 6 अंकों का होना चाहिए।";
      }
      if (!files.check_photo && !distributorProfile?.security_deposit_check_photo) {
        return language === "en" ? "Upload first cheque image." : "पहली चेक इमेज अपलोड करें।";
      }

      if (!form.bank_name_2.trim()) return language === "en" ? "Second bank name is required." : "दूसरा बैंक नाम आवश्यक है।";
      if (!CHEQUE_NUMBER_REGEX.test(form.check_number_2.trim())) {
        return language === "en" ? "Second cheque number must be exactly 6 digits." : "दूसरा चेक नंबर ठीक 6 अंकों का होना चाहिए।";
      }
      if (!files.check_photo_2 && !distributorProfile?.security_deposit_check_photo2) {
        return language === "en" ? "Upload second cheque image." : "दूसरी चेक इमेज अपलोड करें।";
      }
      if (!isBankVerified) {
        return language === "en" ? "Please verify your bank account." : "कृपया अपना बैंक खाता सत्यापित करें।";
      }
    }

    return null;
  };

  const handleVerifyBank = async () => {
    if (!form.bank_account_number || !form.bank_ifsc_code) {
      toast({
        title: language === "en" ? "Missing Details" : "विवरण गायब हैं",
        description: language === "en" ? "Please enter bank account number and IFSC code." : "कृपया बैंक खाता संख्या और IFSC कोड दर्ज करें।",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingBank(true);
    try {
      const res = await api.distributorsApi.verifyDistributorBank({
        bank_account: form.bank_account_number,
        ifsc: form.bank_ifsc_code,
        name: form.bank_account_holder_name || form.business_name
      });

      if (res.success && res.data) {
        setBankVerifiedValue(form.bank_account_number);
        setVerifiedBankName(res.data.bank_name || null);
        setVerifiedBankHolder(res.data.registered_name || null);
        toast({
          title: language === "en" ? "Bank Verified" : "बैंक सत्यापित",
          description: language === "en" 
            ? `Verified: ${res.data.registered_name} (${res.data.bank_name})`
            : `सत्यापित: ${res.data.registered_name} (${res.data.bank_name})`,
          variant: "success"
        });
      } else {
        toast({
          title: language === "en" ? "Verification Failed" : "सत्यापन विफल",
          description: res.message || (language === "en" ? "Could not verify bank account." : "बैंक खाते को सत्यापित नहीं किया जा सका।"),
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: err.message || "Failed to verify bank account",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingBank(false);
    }
  };

  const captureOnboardingLocation = async () => {
    if (!navigator.geolocation) return;
    
    setIsCapturingLocation(true);
    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateField("onboarding_lat", String(pos.coords.latitude));
          updateField("onboarding_lng", String(pos.coords.longitude));
          setIsCapturingLocation(false);
          resolve();
        },
        (err) => {
          console.error("Location capture failed:", err);
          setIsCapturingLocation(false);
          resolve(); // Still resolve to not block, but backend will see missing coords if needed
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const validateAllSteps = () => {
    const steps: StepKey[] = [1, 2, 3, 4];
    for (const currentStep of steps) {
      const error = validateStep(currentStep);
      if (error) return error;
    }
    return null;
  };

  const verifyPan = async () => {
    if (!currentPan || !form.business_name.trim()) {
      toast({
        title: language === "en" ? "PAN verification blocked" : "पैन सत्यापन रुका हुआ है",
        description: language === "en"
          ? "Enter business name and PAN number first."
          : "पहले व्यवसाय का नाम और पैन नंबर दर्ज करें।",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPan(true);
    const response = await api.distributorsApi.verifyPan({
      pan_number: currentPan,
      business_name: form.business_name.trim(),
    });
    setIsVerifyingPan(false);

    if (response.success) {
      setPanVerifiedValue(currentPan);
      toast({
        title: language === "en" ? "Individual PAN verified" : "व्यक्तिगत पैन सत्यापित",
        description: language === "en"
          ? "Individual PAN verification completed successfully."
          : "व्यक्तिगत पैन सत्यापन सफलतापूर्वक पूरा हो गया।",
        variant: "success",
      });
      return;
    }

    toast({
      title: language === "en" ? "PAN verification failed" : "पैन सत्यापन विफल",
      description: response.error?.message || (language === "en" ? "Unable to verify PAN." : "पैन सत्यापित नहीं हो सका।"),
      variant: "destructive",
    });
  };

  const verifyGst = async () => {
    if (!currentGst || !form.business_name.trim()) {
      toast({
        title: language === "en" ? "GST verification blocked" : "जीएसटी सत्यापन रुका हुआ है",
        description: language === "en"
          ? "Enter business name and GST number first."
          : "पहले व्यवसाय का नाम और जीएसटी नंबर दर्ज करें।",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingGst(true);
    const response = await api.distributorsApi.verifyGst({
      gst_number: currentGst,
      business_name: form.business_name.trim(),
    });
    setIsVerifyingGst(false);

    if (response.success) {
      setGstVerifiedValue(currentGst);
      toast({
        title: language === "en" ? "GST verified" : "जीएसटी सत्यापित",
        description: language === "en"
          ? "GST verification completed successfully."
          : "जीएसटी सत्यापन सफलतापूर्वक पूरा हो गया।",
        variant: "success",
      });
      return;
    }

    toast({
      title: language === "en" ? "GST verification failed" : "जीएसटी सत्यापन विफल",
      description: response.error?.message || (language === "en" ? "Unable to verify GST." : "जीएसटी सत्यापित नहीं हो सका।"),
      variant: "destructive",
    });
  };

  const verifyAadhaar = async () => {
    if (currentAadhaar.length !== 12) {
      toast({
        title: language === "en" ? "Aadhaar verification blocked" : "आधार सत्यापन रुका हुआ है",
        description: language === "en"
          ? "Enter a valid 12-digit Aadhaar number first."
          : "पहले मान्य 12 अंकों का आधार नंबर दर्ज करें।",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingAadhaar(true);
    const response = await api.distributorsApi.initiateAadhaarVerification({
      aadhaar_number: currentAadhaar,
    });
    setIsVerifyingAadhaar(false);

    if (response.success && response.data?.verification_id) {
      setAadhaarVerificationId(response.data.verification_id);
      if (response.data.verification_url) {
        window.open(response.data.verification_url, "_blank", "noopener,noreferrer");
      }
      toast({
        title: language === "en" ? "Continue Aadhaar verification" : "आधार सत्यापन जारी रखें",
        description: language === "en"
          ? "Complete the DigiLocker flow in the opened window, then return here."
          : "खुले हुए DigiLocker विंडो में प्रक्रिया पूरी करें, फिर यहां लौटें।",
        variant: "success",
      });
      return;
    }

    toast({
      title: language === "en" ? "Aadhaar verification failed" : "आधार सत्यापन विफल",
      description: response.error?.message || (language === "en" ? "Unable to start Aadhaar verification." : "आधार सत्यापन शुरू नहीं हो सका।"),
      variant: "destructive",
    });
  };

  const submitForm = async () => {
    const finalError = validateAllSteps();
    if (finalError) {
      toast({
        title: language === "en" ? "Complete all details" : "सभी विवरण पूरे करें",
        description: finalError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Always capture fresh location before submittting
    await captureOnboardingLocation();

    const formData = new FormData();
    formData.append("business_name", form.business_name.trim());
    formData.append("name", form.business_name.trim());
    formData.append("owner_name", user?.full_name || "");
    formData.append("onboarding_lat", form.onboarding_lat);
    formData.append("onboarding_lng", form.onboarding_lng);
    formData.append("phone", form.phone.trim());
    formData.append("whatsapp", form.whatsapp.trim());
    formData.append("email", form.email.trim());
    formData.append("address_street", form.address_street.trim());
    formData.append("address_area", form.address_area.trim());
    formData.append("address_city", form.address_city.trim());
    formData.append("address_state", form.address_state.trim());
    formData.append("address_pincode", form.address_pincode.trim());
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("aadhaar_number", currentAadhaar);
    formData.append("pan_number", currentPan);
    formData.append("expected_business_volume", form.expected_business_volume.trim());
    formData.append("license_number", form.license_number.trim());
    formData.append("gst_number", currentGst);
    formData.append("bank_name", form.bank_name.trim());
    formData.append("check_number", form.check_number.trim());
    formData.append("bank_name_2", form.bank_name_2.trim());
    formData.append("check_number_2", form.check_number_2.trim());

    (Object.entries(files) as [DocKey, File | null][]).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    const response = await api.distributorsApi.onboard(formData);
    setIsSubmitting(false);

    if (response.success && response.data) {
      setDistributorProfile(response.data);
      window.localStorage.removeItem(DRAFT_KEY);

      if (isApprovedDealer) {
        toast({
          title: language === "en" ? "Business profile updated" : "बिज़नेस प्रोफ़ाइल अपडेट हुई",
          description: language === "en"
            ? "Your approved business profile has been updated."
            : "आपकी स्वीकृत बिज़नेस प्रोफ़ाइल अपडेट हो गई है।",
          variant: "success",
        });
        router.push("/dashboard/dealer");
        return;
      }

      toast({
        title: language === "en" ? "Business profile submitted" : "बिज़नेस प्रोफ़ाइल जमा हुई",
        description: language === "en"
          ? "Your website business profile is now under review."
          : "आपकी वेबसाइट बिज़नेस प्रोफ़ाइल अब समीक्षा में है।",
        variant: "success",
      });
      router.push("/dashboard/dealer/review");
      return;
    }

    toast({
      title: language === "en" ? "Submission failed" : "सबमिशन विफल",
      description: response.error?.message || (language === "en" ? "Unable to submit business profile." : "बिज़नेस प्रोफ़ाइल सबमिट नहीं हो सकी।"),
      variant: "destructive",
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div>
        <Button variant="ghost" asChild className="-ml-2 mb-4">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "en" ? "Back to home" : "होम पर वापस"}
          </Link>
        </Button>
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              {isApprovedDealer
                ? (language === "en" ? "Business Profile" : "बिज़नेस प्रोफ़ाइल")
                : (language === "en" ? "Business Verification" : "बिज़नेस सत्यापन")}
            </div>
            <h1 className="mt-4 text-4xl font-bold">
              {isApprovedDealer
                ? (language === "en" ? "Manage your business profile" : "अपनी बिज़नेस प्रोफ़ाइल प्रबंधित करें")
                : (language === "en" ? "Complete your business onboarding" : "अपना बिज़नेस ऑनबोर्डिंग पूरा करें")}
            </h1>
            <p className="mt-4 text-base text-white/75">
              {isApprovedDealer
                ? (language === "en"
                    ? "Review and update your approved business, contact, banking, and compliance details from one place."
                    : "एक ही स्थान से अपनी स्वीकृत बिज़नेस, संपर्क, बैंकिंग और अनुपालन जानकारी की समीक्षा और अपडेट करें।")
                : (language === "en"
                    ? "Submit your business profile, compliance details, and verification documents to activate your website account."
                    : "अपना वेबसाइट खाता सक्रिय करने के लिए व्यवसाय प्रोफ़ाइल, अनुपालन विवरण और सत्यापन दस्तावेज जमा करें।")}
            </p>
          </div>
        </div>
      </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {language === "en" ? "Business Information" : "व्यवसाय जानकारी"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Use your business-specific contact and address details here."
                : "यहां अपने व्यवसाय-विशिष्ट संपर्क और पते का उपयोग करें।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  {language === "en" ? "Business Name" : "व्यवसाय का नाम"}
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <Input
                  value={form.business_name}
                  disabled={hasLockedApprovedProfile}
                  onChange={(e) => updateField("business_name", e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    {language === "en" ? "Business Contact Number" : "व्यवसाय संपर्क नंबर"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={useSamePhone} onCheckedChange={(checked) => setUseSamePhone(Boolean(checked))} />
                    {language === "en" ? "Use personal number" : "व्यक्तिगत नंबर उपयोग करें"}
                  </label>
                </div>
                <Input
                  value={form.phone}
                  disabled={useSamePhone}
                  onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{language === "en" ? "Business Email" : "बिज़नेस ईमेल"}</Label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={useSameEmail} onCheckedChange={(checked) => setUseSameEmail(Boolean(checked))} />
                    {language === "en" ? "Use personal email" : "व्यक्तिगत ईमेल उपयोग करें"}
                  </label>
                </div>
                <Input
                  type="email"
                  value={form.email}
                  disabled={useSameEmail}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "en" ? "WhatsApp Number" : "व्हाट्सएप नंबर"}</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {language === "en" ? "Expected Business Volume" : "अपेक्षित व्यवसाय मात्रा"}
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                {hasLockedApprovedProfile ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {language === "en"
                      ? "This field is admin-managed after approval. Contact support or admin if you need it updated."
                      : "स्वीकृति के बाद यह फ़ील्ड केवल एडमिन द्वारा बदली जा सकती है। बदलाव के लिए सपोर्ट या एडमिन से संपर्क करें।"}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-2">
                  {businessVolumeOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      disabled={hasLockedApprovedProfile}
                      onClick={() => updateField("expected_business_volume", option)}
                      className={`rounded-xl border px-3 py-3 text-sm ${
                        form.expected_business_volume === option
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white hover:border-primary/40"
                      } ${hasLockedApprovedProfile ? "cursor-not-allowed opacity-60 hover:border-gray-200" : ""}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                {language === "en" ? "Business Address" : "व्यवसाय पता"}
              </div>
              <div className="mb-5">
                <LocationPicker
                  initialLat={form.latitude ? Number(form.latitude) : undefined}
                  initialLng={form.longitude ? Number(form.longitude) : undefined}
                  onLocationSelect={(location) => {
                    setForm((prev) => ({
                      ...prev,
                      address_street: location.address || prev.address_street,
                      address_city: location.city || prev.address_city,
                      address_state: location.state || prev.address_state,
                      address_pincode: location.pincode || prev.address_pincode,
                      latitude: String(location.lat),
                      longitude: String(location.lng),
                    }));
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>
                    {language === "en" ? "Street Address" : "सड़क पता"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input value={form.address_street} onChange={(e) => updateField("address_street", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Area / Locality" : "क्षेत्र / लोकैलिटी"}</Label>
                  <Input value={form.address_area} onChange={(e) => updateField("address_area", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "City" : "शहर"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input value={form.address_city} onChange={(e) => updateField("address_city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "State" : "राज्य"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input value={form.address_state} onChange={(e) => updateField("address_state", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Pincode" : "पिनकोड"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input value={form.address_pincode} onChange={(e) => updateField("address_pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Latitude" : "अक्षांश"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input value={form.latitude} onChange={(e) => updateField("latitude", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Longitude" : "देशांतर"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input value={form.longitude} onChange={(e) => updateField("longitude", e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {language === "en" ? "Identity Verification" : "पहचान सत्यापन"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Verify Aadhaar and Individual PAN before submitting."
                : "सबमिट करने से पहले आधार और व्यक्तिगत पैन सत्यापित करें।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="mb-6 rounded-3xl bg-emerald-50/50 p-6 border border-emerald-100 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h4 className="font-bold text-emerald-900 flex items-center justify-center md:justify-start gap-2 text-lg">
                  <Camera className="h-6 w-6" />
                  Live Verification Snapshot (Mandatory)
                </h4>
                <p className="text-sm text-emerald-700">
                  Please take a real-time photo for identity verification. This is required for security and account safety.
                </p>
              </div>
              <div className="w-full md:w-auto">
                <DocumentCard
                  label=""
                  file={files.owner_photo}
                  preview={previews.owner_photo}
                  existingUrl={distributorProfile?.owner_photo_url}
                  disabled={hasLockedApprovedProfile}
                  onCameraClick={() => setShowCamera(true)}
                  onClear={() => clearFile("owner_photo")}
                />
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl bg-slate-50/70 p-5">
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Aadhaar Number" : "आधार नंबर"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.aadhaar_number}
                    disabled={hasLockedApprovedProfile || isAadhaarVerified}
                    onChange={(e) => updateField("aadhaar_number", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  />
                </div>
                <Button type="button" onClick={verifyAadhaar} disabled={isVerifyingAadhaar || hasLockedApprovedProfile || isAadhaarVerified} className={`rounded-xl transition-all duration-300 ${isAadhaarVerified ? "bg-green-600 hover:bg-green-600 opacity-100 cursor-default shadow-none border-green-700" : ""}`}>
                  {isVerifyingAadhaar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isAadhaarVerified ? <BadgeCheck className="mr-2 h-4 w-4" /> : null}
                  {isAadhaarVerified
                    ? (language === "en" ? "Aadhaar Verified" : "आधार सत्यापित")
                    : (language === "en" ? "Verify Aadhaar" : "आधार सत्यापित करें")}
                </Button>
                <div className="grid gap-4 md:grid-cols-2">
                  <DocumentCard
                    label={language === "en" ? "Aadhaar Front" : "आधार फ्रंट"}
                    file={files.aadhaar_front_photo}
                    preview={previews.aadhaar_front_photo}
                    existingUrl={distributorProfile?.aadhaar_front_photo_url}
                    disabled={hasLockedApprovedProfile}
                    onSelect={(file) => updateFile("aadhaar_front_photo", file)}
                    onClear={() => clearFile("aadhaar_front_photo")}
                  />
                  <DocumentCard
                    label={language === "en" ? "Aadhaar Back" : "आधार बैक"}
                    file={files.aadhaar_back_photo}
                    preview={previews.aadhaar_back_photo}
                    existingUrl={distributorProfile?.aadhaar_back_photo_url}
                    disabled={hasLockedApprovedProfile}
                    onSelect={(file) => updateFile("aadhaar_back_photo", file)}
                    onClear={() => clearFile("aadhaar_back_photo")}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-3xl bg-slate-50/70 p-5">
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Individual PAN Number" : "व्यक्तिगत पैन नंबर"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.pan_number}
                    disabled={hasLockedApprovedProfile || isPanVerified}
                    onChange={(e) => updateField("pan_number", normalizePan(e.target.value).slice(0, 10))}
                    className="uppercase"
                  />
                </div>
                <Button type="button" onClick={verifyPan} disabled={isVerifyingPan || hasLockedApprovedProfile || isPanVerified} className={`rounded-xl transition-all duration-300 ${isPanVerified ? "bg-green-600 hover:bg-green-600 opacity-100 cursor-default shadow-none border-green-700" : ""}`}>
                  {isVerifyingPan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isPanVerified ? <BadgeCheck className="mr-2 h-4 w-4" /> : null}
                  {isPanVerified
                    ? (language === "en" ? "Individual PAN Verified" : "व्यक्तिगत पैन सत्यापित")
                    : (language === "en" ? "Verify Individual PAN" : "व्यक्तिगत पैन सत्यापित करें")}
                </Button>
                <DocumentCard
                  label={language === "en" ? "Individual PAN Photo" : "व्यक्तिगत पैन फोटो"}
                  file={files.pan_photo}
                  preview={previews.pan_photo}
                  existingUrl={distributorProfile?.pan_photo_url}
                  disabled={hasLockedApprovedProfile}
                  onSelect={(file) => updateFile("pan_photo", file)}
                  onClear={() => clearFile("pan_photo")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              {language === "en" ? "License & GST" : "लाइसेंस और जीएसटी"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Add your fertilizer or seed license and GST details."
                : "अपना उर्वरक या बीज लाइसेंस और जीएसटी विवरण जोड़ें।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4 rounded-3xl bg-slate-50/70 p-5">
                <div className="space-y-2">
                  <Label>
                    {language === "en" ? "Seed / Fertilizer License Number" : "बीज / उर्वरक लाइसेंस नंबर"}
                    <span className="ml-1 text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.license_number}
                    disabled={hasLockedApprovedProfile}
                    maxLength={30}
                    onChange={(e) =>
                      updateField(
                        "license_number",
                        e.target.value.toUpperCase().replace(/[^A-Z0-9/\- ]/g, "").slice(0, 30)
                      )
                    }
                  />
                </div>
                <DocumentCard
                  label={language === "en" ? "License Photo" : "लाइसेंस फोटो"}
                  file={files.license_photo}
                  preview={previews.license_photo}
                  existingUrl={distributorProfile?.license_photo_url}
                  disabled={hasLockedApprovedProfile}
                  onSelect={(file) => updateFile("license_photo", file)}
                  onClear={() => clearFile("license_photo")}
                />
              </div>

              <div className="space-y-4 rounded-3xl bg-slate-50/70 p-5">
                <div className="space-y-2">
                  <Label>{language === "en" ? "GST Number" : "जीएसटी नंबर"}</Label>
                  <Input
                    value={form.gst_number}
                    disabled={hasLockedApprovedProfile}
                    onChange={(e) => updateField("gst_number", normalizeGst(e.target.value).slice(0, 15))}
                    className="uppercase"
                  />
                </div>
                <DocumentCard
                  label={language === "en" ? "GST Certificate" : "जीएसटी प्रमाणपत्र"}
                  file={files.gst_photo}
                  preview={previews.gst_photo}
                  existingUrl={distributorProfile?.gst_photo_url}
                  disabled={hasLockedApprovedProfile}
                  onSelect={(file) => updateFile("gst_photo", file)}
                  onClear={() => clearFile("gst_photo")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {language === "en" ? "Bank & Cheque Details" : "बैंक और चेक विवरण"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Add the bank and cheque details required for verification."
                : "सत्यापन के लिए आवश्यक बैंक और चेक विवरण जोड़ें।"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              {/* Sub-section 1: Bank Account Verification */}
              <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10">
                <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">1</span>
                  {language === "en" ? "Account Verification (Penny Drop)" : "बैंक खाता सत्यापन"}
                </h4>
                <CardDescription className="mb-4">
                  {language === "en" 
                    ? "Enter your actual bank account details. We will verify this by depositing ₹1 and matching details."
                    : "अपना वास्तविक बैंक खाता विवरण दर्ज करें। हम ₹1 जमा करके और विवरणों का मिलान करके इसे सत्यापित करेंगे।"}
                </CardDescription>

                <div className="grid gap-5 md:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Account Holder Name" : "खाताधारक का नाम"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input 
                      value={form.bank_account_holder_name} 
                      disabled={hasLockedApprovedProfile || isBankVerified} 
                      onChange={(e) => updateField("bank_account_holder_name", e.target.value)} 
                      placeholder="As per bank records"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Bank Name" : "बैंक नाम"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input 
                      value={form.bank_actual_name} 
                      disabled={hasLockedApprovedProfile || isBankVerified} 
                      onChange={(e) => updateField("bank_actual_name", e.target.value)} 
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Account Number" : "खाता संख्या"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input 
                      value={form.bank_account_number} 
                      disabled={hasLockedApprovedProfile || isBankVerified} 
                      onChange={(e) => updateField("bank_account_number", e.target.value.replace(/\D/g, ""))} 
                      placeholder="000000000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "IFSC Code" : "IFSC कोड"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input 
                      value={form.bank_ifsc_code} 
                      disabled={hasLockedApprovedProfile || isBankVerified} 
                      className="uppercase"
                      onChange={(e) => updateField("bank_ifsc_code", e.target.value.toUpperCase().slice(0, 11))} 
                      placeholder="SBIN0001234"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleVerifyBank}
                  disabled={isVerifyingBank || isBankVerified || hasLockedApprovedProfile}
                  className="w-full md:w-auto"
                >
                  {isVerifyingBank ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === "en" ? "Verifying..." : "सत्यापित किया जा रहा है..."}
                    </>
                  ) : isBankVerified ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {language === "en" ? "Verified" : "सत्यापित"}
                    </>
                  ) : (
                    language === "en" ? "Verify Account" : "खाता सत्यापित करें"
                  )}
                </Button>

                {isBankVerified && (
                  <div className="mt-6 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                      Verified Bank Details
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Account Holder</div>
                        <div className="text-sm font-semibold">{verifiedBankHolder || "--"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Bank Name</div>
                        <div className="text-sm font-semibold">{verifiedBankName || "--"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Account No.</div>
                        <div className="text-sm font-semibold">{form.bank_account_number}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">IFSC Code</div>
                        <div className="text-sm font-semibold uppercase">{form.bank_ifsc_code}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-2 border-slate-200" />

              {/* Sub-section 2: Security Cheque 1 */}
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white text-xs">2</span>
                  {language === "en" ? "Security Cheque 1" : "सुरक्षा चेक 1"}
                </h4>
                <div className="grid gap-5 md:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Bank Name" : "बैंक नाम"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input value={form.bank_name} disabled={hasLockedApprovedProfile} onChange={(e) => updateField("bank_name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Cheque Number" : "चेक नंबर"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.check_number}
                      disabled={hasLockedApprovedProfile}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(e) => updateField("check_number", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>
                </div>
                <DocumentCard
                  label={language === "en" ? "Cheque Photo" : "चेक फोटो"}
                  file={files.check_photo}
                  preview={previews.check_photo}
                  existingUrl={distributorProfile?.security_deposit_check_photo}
                  disabled={hasLockedApprovedProfile}
                  onSelect={(file) => updateFile("check_photo", file)}
                  onClear={() => clearFile("check_photo")}
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white text-xs">3</span>
                  {language === "en" ? "Security Cheque 2" : "सुरक्षा चेक 2"}
                </h4>
                <div className="grid gap-5 md:grid-cols-2 mb-4">
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Bank Name" : "बैंक नाम"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input value={form.bank_name_2} disabled={hasLockedApprovedProfile} onChange={(e) => updateField("bank_name_2", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "en" ? "Cheque Number" : "चेक नंबर"}
                      <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.check_number_2}
                      disabled={hasLockedApprovedProfile}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(e) => updateField("check_number_2", e.target.value.replace(/\D/g, "").slice(0, 6))}
                    />
                  </div>
                </div>
                <DocumentCard
                  label={language === "en" ? "Cheque Photo" : "चेक फोटो"}
                  file={files.check_photo_2}
                  preview={previews.check_photo_2}
                  existingUrl={distributorProfile?.security_deposit_check_photo2}
                  disabled={hasLockedApprovedProfile}
                  onSelect={(file) => updateFile("check_photo_2", file)}
                  onClear={() => clearFile("check_photo_2")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="outline" asChild className="rounded-xl">
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "en" ? "Back" : "वापस"}
          </Link>
        </Button>

        <Button
          type="button"
          onClick={submitForm}
          disabled={isSubmitting || (isApprovedDealer && !hasApprovedProfileChanges)}
          className="min-w-[220px] rounded-xl"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isApprovedDealer
            ? (language === "en" ? "Save Changes" : "परिवर्तन सहेजें")
            : (language === "en" ? "Submit for Review" : "समीक्षा के लिए जमा करें")}
        </Button>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-primary/5 px-5 py-4 text-sm text-primary">
        {isApprovedDealer
          ? (language === "en"
              ? "Contact, address, and non-sensitive profile details can be updated here. Legal, verification, banking, and business volume fields are admin-managed after approval."
              : "आप यहां संपर्क, पता और गैर-संवेदनशील प्रोफ़ाइल विवरण अपडेट कर सकते हैं। स्वीकृति के बाद कानूनी, सत्यापन, बैंकिंग और व्यवसाय मात्रा फ़ील्ड केवल एडमिन द्वारा बदली जा सकती हैं।")
          : (language === "en"
              ? "Your progress on this website form is saved locally as you move between steps. Uploaded files need to be selected again if you switch devices or clear browser storage."
              : "जब आप चरण बदलते हैं, तो इस वेबसाइट फ़ॉर्म की प्रगति स्थानीय रूप से सेव होती रहती है। यदि आप डिवाइस बदलते हैं या ब्राउज़र स्टोरेज साफ करते हैं, तो अपलोड की गई फ़ाइलें फिर से चुननी होंगी।")}
      </div>

      <Dialog open={isSubmitting}>
        <DialogContent className="flex flex-col items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="mt-4 font-semibold text-white text-center px-6">
            {isCapturingLocation 
              ? (language === "en" ? "Verifying Presence & Location..." : "उपस्थिति और स्थान सत्यापित किया जा रहा है...")
              : (language === "en" ? "Submitting Application..." : "आवेदन जमा किया जा रहा है...")}
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-lg p-0 border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">Take Photo</DialogTitle>
          <CameraCapture 
            onCapture={async (file) => {
              updateFile("owner_photo", file);
              await captureOnboardingLocation();
              setShowCamera(false);
            }} 
            onCancel={() => setShowCamera(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

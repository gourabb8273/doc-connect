"use client";

import { useState } from "react";
import Image from "next/image";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Eye,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";
import { DEFAULT_VISIBILITY, type VisibilitySettings } from "@/lib/visibility";
import type { AvailabilityStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// Demo: load first verified doctor
const DEMO_DOCTOR = {
  name: "Dr. Ananya Sen",
  photoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  specialization: "General Physician",
  registrationNumber: "WBMC-2008-14523",
  stateMedicalCouncil: "WBMC",
  status: "verified" as "pending" | "verified" | "rejected" | "suspended",
  availabilityStatus: "available" as AvailabilityStatus,
  clinicName: "Sen Clinic",
  locality: "Mogra, 700141",
  consultationFee: 400,
  phone: "+91-98300-11001",
};

const STATUS_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "available", label: "Available Now", color: "bg-emerald-500" },
  { value: "busy", label: "Busy", color: "bg-amber-500" },
  { value: "delayed", label: "Delayed", color: "bg-orange-500" },
  { value: "on_leave", label: "On Leave", color: "bg-slate-400" },
];

export default function DoctorDashboardPage() {
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus>(
    DEMO_DOCTOR.availabilityStatus
  );
  const [visibility, setVisibility] = useState<VisibilitySettings>({
    ...DEFAULT_VISIBILITY,
    showPhone: true,
    showFee: true,
  });

  const isPending = DEMO_DOCTOR.status === "pending";
  const isVerified = DEMO_DOCTOR.status === "verified";

  return (
    <AuthGuard required="doctor" redirectTo="/doctor/login">
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* Pending banner */}
      {isPending && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Your profile is under review</p>
            <p className="text-xs text-amber-600 mt-0.5">
              We&apos;re verifying your WBMC registration. You&apos;ll receive an SMS once approved.
            </p>
          </div>
        </div>
      )}

      {/* ── Block A: Live Status ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Your status right now
          </h2>
          <StatusBadge status={availStatus} size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAvailStatus(opt.value)}
              disabled={isPending}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                availStatus === opt.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-100 hover:border-slate-200 bg-white",
                isPending && "opacity-40 cursor-not-allowed"
              )}
            >
              <span className={cn("w-3 h-3 rounded-full", opt.color)} />
              <span
                className={cn(
                  "text-xs font-medium text-center",
                  availStatus === opt.value ? "text-indigo-700" : "text-slate-600"
                )}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {isVerified && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Status updates are visible to patients in real time
          </p>
        )}
      </div>

      {/* ── Block B: Profile Summary ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-slate-100 shrink-0">
            <Image
              src={DEMO_DOCTOR.photoUrl}
              alt={DEMO_DOCTOR.name}
              width={56}
              height={56}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-semibold text-slate-900">{DEMO_DOCTOR.name}</span>
              {isVerified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-slate-500">{DEMO_DOCTOR.specialization}</p>
            <p className="text-xs text-slate-400">{DEMO_DOCTOR.clinicName} · {DEMO_DOCTOR.locality}</p>
          </div>
          <Link
            href="/doctor/profile"
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* ── Block C: Visibility Controls ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            What patients can see
          </h2>
          <span className="text-xs text-slate-400">Toggle to control</span>
        </div>

        <div className="px-1">
          <VisibilityToggle
            label="Phone number"
            description="Let patients call you"
            checked={visibility.showPhone}
            onChange={(v) => setVisibility({ ...visibility, showPhone: v })}
            disabled={isPending}
          />
          <VisibilityToggle
            label="Consultation fee"
            description={`₹${DEMO_DOCTOR.consultationFee} per visit`}
            checked={visibility.showFee}
            onChange={(v) => setVisibility({ ...visibility, showFee: v })}
            disabled={isPending}
          />
          <VisibilityToggle
            label="Exact address"
            description="Off = locality only"
            checked={visibility.showExactAddress}
            onChange={(v) => setVisibility({ ...visibility, showExactAddress: v })}
            disabled={isPending}
          />
          <VisibilityToggle
            label="Running late note"
            description="Show message when status is Delayed"
            checked={visibility.showAvailabilityNote}
            onChange={(v) => setVisibility({ ...visibility, showAvailabilityNote: v })}
            disabled={isPending}
          />
        </div>

        {isPending && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" />
            Visibility settings apply once your profile is approved
          </div>
        )}
      </div>

      {/* Preview link */}
      {isVerified && (
        <Link
          href="/doctors/dr-001"
          className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview your public profile
        </Link>
      )}
    </div>
    </AuthGuard>
  );
}

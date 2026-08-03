"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  Eye,
  XCircle,
  Calendar,
  Phone,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";
import { DEFAULT_VISIBILITY, type VisibilitySettings } from "@/lib/visibility";
import type { AvailabilityStatus, Doctor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api/client";
import { getDoctorDisplayName } from "@/lib/doctor-name";
import { formatTimeRange, formatDaysShort } from "@/lib/schedule";

const STATUS_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "available", label: "Available Now", color: "bg-emerald-500" },
  { value: "busy", label: "Busy", color: "bg-amber-500" },
  { value: "delayed", label: "Delayed", color: "bg-orange-500" },
  { value: "on_leave", label: "On Leave", color: "bg-slate-400" },
];

export default function DoctorDashboardPage() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus>("on_leave");
  const [visibility, setVisibility] = useState<VisibilitySettings>(DEFAULT_VISIBILITY);

  useEffect(() => {
    apiGet<{ doctor: Doctor | null }>("/api/doctors/me")
      .then((res) => {
        if (res.doctor) {
          setDoctor(res.doctor);
          setAvailStatus(res.doctor.availabilityStatus);
          setVisibility(res.doctor.visibility);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AuthGuard required="doctor" redirectTo="/doctor/login">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
          Loading your profile…
        </div>
      </AuthGuard>
    );
  }

  if (!doctor) {
    return (
      <AuthGuard required="doctor" redirectTo="/doctor/login">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-600 mb-4">No profile yet. Complete registration to get started.</p>
          <Link
            href="/doctor/onboarding"
            className="inline-flex px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl"
          >
            Start onboarding
          </Link>
        </div>
      </AuthGuard>
    );
  }

  const loc = doctor.practiceLocations[0];
  const displayName = getDoctorDisplayName(doctor);
  const isPending = doctor.status === "pending";
  const isVerified = doctor.status === "verified";
  const isRejected = doctor.status === "rejected";

  return (
    <AuthGuard required="doctor" redirectTo="/doctor/login">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {isRejected && doctor.rejectionReason && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Changes requested by admin</p>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">{doctor.rejectionReason}</p>
              <Link
                href="/doctor/onboarding"
                className="inline-flex mt-3 text-sm font-semibold text-red-800 underline hover:no-underline"
              >
                Fix details & resubmit →
              </Link>
            </div>
          </div>
        )}

        {isPending && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Your profile is under review</p>
              <p className="text-xs text-amber-600 mt-0.5">
                We&apos;re verifying your registration. You&apos;ll be notified once approved.
              </p>
            </div>
          </div>
        )}

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
                disabled={!isVerified}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  availStatus === opt.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-100 hover:border-slate-200 bg-white",
                  !isVerified && "opacity-40 cursor-not-allowed"
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

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-slate-100 shrink-0">
              <Image
                src={doctor.photoUrl}
                alt={displayName}
                width={56}
                height={56}
                className="object-cover w-full h-full"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-semibold text-slate-900">{displayName}</span>
                {isVerified && <VerifiedBadge />}
              </div>
              <p className="text-sm text-slate-500">{doctor.specialization}</p>
              {loc && (
                <p className="text-xs text-slate-400">
                  {loc.name} · {loc.locality}
                </p>
              )}
            </div>
            {isRejected && (
              <Link
                href="/doctor/onboarding"
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit & resubmit
              </Link>
            )}
          </div>
        </div>

        {(doctor.practiceLocations.length > 0 || doctor.appointmentRules) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Your clinics, schedule & booking rules
            </h2>
            {doctor.practiceLocations.map((clinic, i) => (
              <div key={i} className="text-sm border border-slate-100 rounded-xl p-3 space-y-1.5">
                <p className="font-semibold text-slate-800">{clinic.name}</p>
                <p className="text-xs text-slate-500">{clinic.locality}, {clinic.pincode}</p>
                {(clinic.schedule ?? []).map((slot, j) => (
                  <p key={j} className="text-slate-700">
                    {formatDaysShort(slot.days)} · {formatTimeRange(slot.startTime, slot.endTime)}
                  </p>
                ))}
                {clinic.appointmentRules?.appointmentPhone && (
                  <p className="text-slate-600 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    Book: {clinic.appointmentRules.appointmentPhone}
                  </p>
                )}
                {clinic.appointmentRules?.instructions && (
                  <p className="text-xs text-slate-500">{clinic.appointmentRules.instructions}</p>
                )}
              </div>
            ))}
            {isRejected && (
              <Link href="/doctor/onboarding" className="text-xs text-indigo-600 font-medium hover:underline">
                Update clinics →
              </Link>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              What patients can see
            </h2>
          </div>
          <div className="px-1">
            <VisibilityToggle
              label="Phone number"
              description="Let patients call you"
              checked={visibility.showPhone}
              onChange={(v) => setVisibility({ ...visibility, showPhone: v })}
              disabled={!isVerified}
            />
            <VisibilityToggle
              label="Consultation fee"
              description={doctor.consultationFee ? `₹${doctor.consultationFee} per visit` : "Not set"}
              checked={visibility.showFee}
              onChange={(v) => setVisibility({ ...visibility, showFee: v })}
              disabled={!isVerified}
            />
            <VisibilityToggle
              label="Exact address"
              description="Off = locality only"
              checked={visibility.showExactAddress}
              onChange={(v) => setVisibility({ ...visibility, showExactAddress: v })}
              disabled={!isVerified}
            />
          </div>
          {!isVerified && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Visibility settings apply once your profile is approved
            </div>
          )}
        </div>

        {isVerified && (
          <Link
            href={`/doctors/${doctor.id}`}
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

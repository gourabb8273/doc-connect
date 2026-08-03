"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Upload,
  AlertTriangle,
  Clock,
  Building2,
} from "lucide-react";
import type { Doctor, DoctorDocument } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { apiPatch } from "@/lib/api/client";
import { getDoctorDisplayName } from "@/lib/doctor-name";
import { formatTimeRange, formatDaysShort } from "@/lib/schedule";

const DOC_LABELS: Record<string, string> = {
  photo: "Profile photo",
  registration_cert: "Registration certificate",
  degree: "Degree certificate",
  govt_id: "Govt. ID",
  selfie: "Selfie",
  clinic_cover: "Clinic cover",
};

function getDisplayDocs(doctor: Doctor): { type: string; label: string; url?: string }[] {
  if (doctor.documents && doctor.documents.length > 0) {
    return doctor.documents.map((d: DoctorDocument) => ({
      type: d.type,
      label: DOC_LABELS[d.type] ?? d.type,
      url: d.url,
    }));
  }
  return [
    { type: "photo", label: "Profile photo", url: doctor.photoUrl },
    { type: "registration_cert", label: "Registration certificate" },
    { type: "degree", label: "Degree certificate" },
  ];
}

export function ReviewDetailClient({ doctor }: { doctor: Doctor | null }) {
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Doctor not found.</p>
        <Link href="/admin/verifications" className="text-indigo-600 hover:underline text-sm mt-2 block">
          Back to queue
        </Link>
      </div>
    );
  }

  const doctorId = doctor.id;
  const displayName = getDoctorDisplayName(doctor);
  const displayDocs = getDisplayDocs(doctor);

  async function handleApprove() {
    setLoading(true);
    setActionError("");
    try {
      await apiPatch(`/api/admin/verifications/${doctorId}`, { action: "approve" });
      setDecision("approved");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not approve");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) return;
    setLoading(true);
    setActionError("");
    try {
      await apiPatch(`/api/admin/verifications/${doctorId}`, {
        action: "reject",
        rejectionReason: rejectionReason.trim(),
      });
      setDecision("rejected");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not reject");
    } finally {
      setLoading(false);
    }
  }

  if (decision) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          {decision === "approved" ? (
            <>
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Approved</h2>
              <p className="text-slate-500 text-sm mb-6">
                {displayName} is now live in patient search. SMS notification sent.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Rejected</h2>
              <p className="text-slate-500 text-sm mb-1">
                {displayName} has been notified via SMS with your reason.
              </p>
              {rejectionReason && (
                <p className="text-xs text-slate-400 italic mb-6">&quot;{rejectionReason}&quot;</p>
              )}
            </>
          )}
          <Link
            href="/admin/verifications"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Back to queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/admin/verifications"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to queue
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">Pending review</span>
        </div>
        <span className="text-xs text-slate-400">Submitted {timeAgo(doctor.createdAt)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Submitted profile
            </h2>
            <div className="flex gap-4 items-start mb-5">
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-slate-100 shrink-0">
                <Image
                  src={doctor.photoUrl}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">{displayName}</p>
                <p className="text-slate-500 text-sm">{doctor.specialization}</p>
                {doctor.yearsOfExperience > 0 && (
                  <p className="text-slate-400 text-xs">{doctor.yearsOfExperience} years experience</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Registration Number</p>
                  <p className="text-sm font-mono font-semibold text-slate-800">{doctor.registrationNumber}</p>
                  <p className="text-xs text-slate-500">{doctor.stateMedicalCouncil}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Login phone</p>
                  <p className="text-sm text-slate-800">{doctor.phone}</p>
                </div>
              </div>

              {doctor.practiceLocations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 font-medium px-1">
                    Clinics ({doctor.practiceLocations.length})
                  </p>
                  {doctor.practiceLocations.map((clinic, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2">
                      <p className="text-sm font-semibold text-slate-800">{clinic.name}</p>
                      <p className="text-xs text-slate-500">{clinic.address}</p>
                      <p className="text-xs text-slate-400">
                        {clinic.locality}, {clinic.pincode}, {clinic.state}
                      </p>
                      {(clinic.schedule ?? []).map((slot, j) => (
                        <p key={j} className="text-sm text-slate-700">
                          {formatDaysShort(slot.days)} ·{" "}
                          {formatTimeRange(slot.startTime, slot.endTime)}
                        </p>
                      ))}
                      {clinic.appointmentRules && (
                        <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                          {clinic.appointmentRules.appointmentPhone && (
                            <p>Booking phone: {clinic.appointmentRules.appointmentPhone}</p>
                          )}
                          {clinic.appointmentRules.advanceBookingDays != null &&
                            clinic.appointmentRules.advanceBookingDays > 0 && (
                              <p>Book {clinic.appointmentRules.advanceBookingDays} day(s) ahead</p>
                            )}
                          {clinic.appointmentRules.bookingCallWindowStart &&
                            clinic.appointmentRules.bookingCallWindowEnd && (
                              <p>
                                Call window:{" "}
                                {formatTimeRange(
                                  clinic.appointmentRules.bookingCallWindowStart,
                                  clinic.appointmentRules.bookingCallWindowEnd
                                )}
                              </p>
                            )}
                          {clinic.appointmentRules.instructions && (
                            <p className="italic">&quot;{clinic.appointmentRules.instructions}&quot;</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Uploaded documents
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {displayDocs.map((doc) => (
                <div key={doc.type} className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="h-28 bg-slate-50 flex items-center justify-center">
                    {doc.url && (doc.url.startsWith("data:") || doc.url.match(/\.(jpg|jpeg|png|webp|gif)/i) || doc.type === "photo") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doc.url}
                        alt={doc.label}
                        className="object-cover h-full w-full"
                      />
                    ) : doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 font-medium px-2 text-center hover:underline"
                      >
                        View {doc.label}
                      </a>
                    ) : (
                      <FileText className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-slate-600">{doc.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              WBMC Verification
            </h2>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-slate-600">
                Cross-check the registration number on the WBMC portal:
              </p>
              <ol className="space-y-2 text-sm text-slate-600">
                {[
                  "Open WBMC portal (link below)",
                  `Search: ${doctor.registrationNumber}`,
                  "Confirm name & status = Registered",
                  "Take a screenshot for audit",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-slate-100 rounded-full text-xs font-semibold text-slate-500 flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <a
                href="https://wbmc.wb.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-teal-700"
              >
                Open WBMC Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-teal-300 transition-colors">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">Upload WBMC screenshot (audit)</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
              Your decision
            </h2>

            {actionError && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{actionError}</p>
            )}

            {!showRejectForm && (
              <>
                {showConfirm ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-800">
                        {displayName} will appear in public patient search immediately. Confirm?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
                      >
                        {loading ? "Saving..." : "Confirm Approve"}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Profile
                  </button>
                )}
              </>
            )}

            {!showConfirm && (
              <>
                {showRejectForm ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">
                        Reason for changes (shown on doctor dashboard — they can fix & resubmit)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Registration number not found on WBMC portal. Please recheck and resubmit."
                        rows={3}
                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        disabled={!rejectionReason.trim() || loading}
                        className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {loading ? "Sending..." : "Send Rejection"}
                      </button>
                      <button
                        onClick={() => setShowRejectForm(false)}
                        className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

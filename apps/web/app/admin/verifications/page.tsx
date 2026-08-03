import Link from "next/link";
import Image from "next/image";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Clock, CheckCircle2, XCircle, ChevronRight, Users } from "lucide-react";
import { getAllDoctors } from "@/lib/data/doctors";
import { getDoctorDisplayName } from "@/lib/doctor-name";
import type { Doctor } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

function AdminVerificationsContent({ allDoctors }: { allDoctors: Doctor[] }) {
  const pending = allDoctors.filter((d) => d.status === "pending");
  const verified = allDoctors.filter((d) => d.status === "verified");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review doctor submissions and approve or reject
          </p>
        </div>
        <Link
          href="/admin/doctors"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Users className="w-4 h-4" />
          All doctors
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Pending review", value: pending.length, color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock },
          { label: "Verified", value: verified.length, color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
          { label: "Rejected", value: 0, color: "text-slate-600 bg-slate-50 border-slate-100", icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border p-4 ${color}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl font-bold">{value}</span>
              <Icon className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-xs font-medium opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">All caught up!</p>
            <p className="text-sm text-slate-400">No pending verifications right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((doctor) => {
              const displayName = getDoctorDisplayName(doctor);
              return (
              <Link
                key={doctor.id}
                href={`/admin/verifications/${doctor.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-amber-100 p-4 hover:border-amber-300 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-amber-100 shrink-0">
                  <Image
                    src={doctor.photoUrl}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{displayName}</p>
                  <p className="text-sm text-slate-500">
                    {doctor.specialization} · {doctor.stateMedicalCouncil}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {doctor.registrationNumber}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400 mb-1">{timeAgo(doctor.createdAt)}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Recently Verified ({verified.length})
        </h2>
        <div className="space-y-2">
          {verified.slice(0, 5).map((doctor) => {
            const displayName = getDoctorDisplayName(doctor);
            return (
            <div
              key={doctor.id}
              className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-100 shrink-0">
                <Image
                  src={doctor.photoUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-400">{doctor.specialization} · {doctor.practiceLocations[0]?.locality}</p>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default async function AdminVerificationsPage() {
  const allDoctors = await getAllDoctors();

  return (
    <AuthGuard required="admin" redirectTo="/admin/login">
      <AdminVerificationsContent allDoctors={allDoctors} />
    </AuthGuard>
  );
}

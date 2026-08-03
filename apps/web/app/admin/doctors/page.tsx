import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getVerifiedDoctors } from "@/lib/data/doctors";
import { getDoctorDisplayName } from "@/lib/doctor-name";
import type { Doctor } from "@/lib/types";

function AdminDoctorsContent({ verified }: { verified: Doctor[] }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/verifications" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Verified Doctors</h1>
          <p className="text-sm text-slate-500">{verified.length} live on Find Near Doctor</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, specialization, or pincode"
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Doctor
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                Location
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {verified.map((doctor) => {
              const displayName = getDoctorDisplayName(doctor);
              return (
              <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden ring-1 ring-slate-100 shrink-0">
                      <Image
                        src={doctor.photoUrl}
                        alt={displayName}
                        width={36}
                        height={36}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{displayName}</span>
                        <VerifiedBadge />
                      </div>
                      <p className="text-xs text-slate-400">
                        {doctor.specialization} · {doctor.registrationNumber}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <p className="text-slate-700">
                    {doctor.practiceLocations[0]?.locality}
                  </p>
                  <p className="text-xs text-slate-400">
                    {doctor.practiceLocations[0]?.pincode}
                  </p>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <StatusBadge status={doctor.availabilityStatus} size="sm" />
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View profile
                  </Link>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminDoctorsPage() {
  const verified = await getVerifiedDoctors();

  return (
    <AuthGuard required="admin" redirectTo="/admin/login">
      <AdminDoctorsContent verified={verified} />
    </AuthGuard>
  );
}

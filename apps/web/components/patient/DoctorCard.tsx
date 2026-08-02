import Link from "next/link";
import Image from "next/image";
import { Phone, IndianRupee, MapPin, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { CoverBanner } from "@/components/patient/CoverBanner";
import type { Doctor } from "@/lib/types";
import { getAvailabilityLabel, isSeatingToday, getSessionsForDay, formatTimeRange } from "@/lib/schedule";
import { getDoctorCover } from "@/lib/clinic-images";
import { formatFee, cn } from "@/lib/utils";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const clinicCount = doctor.practiceLocations.length;
  const seatingToday = isSeatingToday(doctor);
  const availLabel = getAvailabilityLabel(doctor);
  const cover = getDoctorCover(doctor);
  const primaryLoc = doctor.practiceLocations[0]!;
  const todaySessions = getSessionsForDay(doctor);
  const firstSession = todaySessions[0];

  return (
    <Link href={`/doctors/${doctor.id}`} className="group block h-full">
      <article
        className={cn(
          "relative h-full flex flex-col overflow-hidden rounded-[20px] bg-white",
          "card-shadow transition-all duration-300 ease-out",
          "hover:-translate-y-1.5 hover:card-shadow-hover",
          "active:scale-[0.985]"
        )}
      >
        <CoverBanner
          cover={cover}
          alt={primaryLoc.name}
          className="h-40"
          showThemeBadge={!cover.isCustomPhoto}
        >
          <div className="absolute top-3 right-3">
            <StatusBadge status={doctor.availabilityStatus} size="sm" />
          </div>

          {clinicCount > 1 && (
            <span className="absolute bottom-24 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/40 text-white backdrop-blur-sm">
              {clinicCount} clinics
            </span>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-[3px] ring-white/90 shadow-xl">
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              {doctor.availabilityStatus === "available" && seatingToday && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="min-w-0 pb-0.5">
              <h3 className="font-bold text-white text-[15px] leading-tight truncate drop-shadow-sm">
                {doctor.name}
              </h3>
              <p className="text-white/80 text-xs font-medium truncate">
                {doctor.specialization}
                {doctor.yearsOfExperience > 0 && ` · ${doctor.yearsOfExperience} yrs`}
              </p>
            </div>
          </div>
        </CoverBanner>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <VerifiedBadge />
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md",
                seatingToday && doctor.availabilityStatus !== "on_leave"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
              )}
            >
              {availLabel}
            </span>
          </div>

          {doctor.bio && (
            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{doctor.bio}</p>
          )}

          {firstSession ? (
            <div className="flex items-start gap-2.5 rounded-xl bg-brand-light/60 border border-brand/10 px-3 py-2.5">
              <Clock className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" strokeWidth={2.5} />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-brand uppercase tracking-wide">Today</p>
                <p className="text-xs font-semibold text-zinc-800 truncate">
                  {firstSession.locationName}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {formatTimeRange(firstSession.startTime, firstSession.endTime)}
                  <span className="mx-1">·</span>
                  {firstSession.locality}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-500">
                {primaryLoc.locality}, {primaryLoc.pincode}
              </span>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex gap-2">
              {doctor.visibility.showFee && doctor.consultationFee && (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-zinc-800 bg-zinc-100 px-2.5 py-1.5 rounded-lg">
                  <IndianRupee className="w-3 h-3" />
                  {formatFee(doctor.consultationFee)}
                </span>
              )}
              {doctor.visibility.showPhone && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand bg-brand-light px-2.5 py-1.5 rounded-lg">
                  <Phone className="w-3 h-3" />
                  Call
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-brand group-hover:underline underline-offset-2">
              View profile →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

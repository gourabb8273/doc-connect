import Image from "next/image";
import { Building2, Calendar, Clock, MapPin, Video, ExternalLink } from "lucide-react";
import { CoverBanner } from "@/components/patient/CoverBanner";
import type { PracticeLocation } from "@/lib/types";
import { formatDaysShort, formatTimeRange } from "@/lib/schedule";
import { getClinicCover } from "@/lib/clinic-images";
import { cn } from "@/lib/utils";

interface ClinicScheduleBlockProps {
  location: PracticeLocation;
  specialization: string;
  showExactAddress: boolean;
  index: number;
}

export function ClinicScheduleBlock({
  location,
  specialization,
  showExactAddress,
  index,
}: ClinicScheduleBlockProps) {
  const isOnline = location.consultationType === "online";
  const cover = getClinicCover(location, specialization);

  return (
    <div className="rounded-[20px] overflow-hidden bg-white card-shadow">
      {!isOnline && (
        <CoverBanner
          cover={cover}
          alt={location.name}
          className="h-44"
          showThemeBadge={!cover.isCustomPhoto}
        >
          <div className="absolute bottom-3 left-4 right-4">
            <p className="font-bold text-white text-base drop-shadow-md">{location.name}</p>
            <p className="text-white/75 text-xs font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {location.locality}, {location.pincode}
            </p>
          </div>
          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/90 text-zinc-700 backdrop-blur-sm">
            {location.consultationType === "both" ? "In-person & Online" : "In-person"}
          </span>
        </CoverBanner>
      )}

      {isOnline && (
        <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-brand-light border-b border-zinc-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="font-bold text-zinc-900">{location.name}</p>
            <p className="text-xs text-zinc-500">Video consultation</p>
          </div>
        </div>
      )}

      {!isOnline && showExactAddress && (
        <div className="px-5 py-3 border-b border-zinc-50 flex items-start justify-between gap-3">
          <p className="text-sm text-zinc-600">{location.address}</p>
          <a
            href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark"
          >
            Maps <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          Seating schedule
        </p>

        {(location.schedule ?? []).length === 0 ? (
          <p className="text-sm text-zinc-400 italic">Schedule not listed</p>
        ) : (
          <div className="space-y-2">
            {(location.schedule ?? []).map((slot, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl bg-zinc-50 border border-zinc-100 px-3.5 py-3"
              >
                <div className="flex flex-wrap gap-1">
                  {slot.days.map((day) => (
                    <span
                      key={day}
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md",
                        index === 0 ? "bg-brand text-white" : "bg-zinc-200 text-zinc-700"
                      )}
                    >
                      {day}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-800">
                  <Clock className="w-3.5 h-3.5 text-brand" strokeWidth={2.5} />
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </div>
                <span className="text-[11px] font-medium text-zinc-400 sm:ml-auto">
                  {formatDaysShort(slot.days)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

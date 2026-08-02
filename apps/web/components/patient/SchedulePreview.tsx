import { Calendar, Clock, MapPin } from "lucide-react";
import type { Doctor } from "@/lib/types";
import {
  formatTimeRange,
  getNextUpcomingSession,
  getSessionsForDay,
} from "@/lib/schedule";

interface SchedulePreviewProps {
  doctor: Doctor;
  compact?: boolean;
}

export function SchedulePreview({ doctor, compact = false }: SchedulePreviewProps) {
  const todaySessions = getSessionsForDay(doctor);
  const nextSession = getNextUpcomingSession(doctor);

  if (todaySessions.length > 0) {
    const shown = compact ? todaySessions.slice(0, 2) : todaySessions;
    return (
      <div className="space-y-2">
        {shown.map((session, i) => (
          <div
            key={`${session.locationName}-${i}`}
            className="flex items-start gap-3 rounded-2xl bg-brand-light/50 border border-brand/10 px-4 py-3.5"
          >
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-brand uppercase tracking-wide">Today</p>
              <p className="text-sm font-bold text-zinc-900 truncate">{session.locationName}</p>
              <p className="text-xs font-semibold text-zinc-600">
                {formatTimeRange(session.startTime, session.endTime)}
              </p>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {session.locality}
              </p>
            </div>
          </div>
        ))}
        {compact && todaySessions.length > 2 && (
          <p className="text-xs text-zinc-400 font-medium pl-1">
            +{todaySessions.length - 2} more today
          </p>
        )}
      </div>
    );
  }

  if (nextSession) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-zinc-50 border border-zinc-100 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-zinc-200 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4 text-zinc-600" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Next visit</p>
          <p className="text-sm font-bold text-zinc-800">
            {nextSession.dayLabel} · {formatTimeRange(nextSession.startTime, nextSession.endTime)}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {nextSession.locationName}, {nextSession.locality}
          </p>
        </div>
      </div>
    );
  }

  return <p className="text-sm text-zinc-400 italic">Schedule not listed</p>;
}

export function ClinicCountBadge({ count }: { count: number; className?: string }) {
  if (count <= 1) return null;
  return (
    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
      {count} clinics
    </span>
  );
}

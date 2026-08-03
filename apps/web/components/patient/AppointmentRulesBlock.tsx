import { Phone, Clock, CalendarClock, Info } from "lucide-react";
import type { AppointmentRules } from "@/lib/types";
import { formatTimeRange } from "@/lib/schedule";
import { cn } from "@/lib/utils";

interface AppointmentRulesBlockProps {
  rules: AppointmentRules;
  /** Nested inside clinic card — lighter chrome */
  compact?: boolean;
}

export function AppointmentRulesBlock({ rules, compact }: AppointmentRulesBlockProps) {
  const hasPhone = rules.showAppointmentPhone !== false && rules.appointmentPhone;
  const hasWindow = rules.bookingCallWindowStart && rules.bookingCallWindowEnd;
  const hasAdvance = rules.advanceBookingDays != null && rules.advanceBookingDays > 0;
  const hasInstructions = !!rules.instructions?.trim();

  if (!hasPhone && !hasWindow && !hasAdvance && !hasInstructions) return null;

  return (
    <div
      className={cn(
        "space-y-3",
        !compact && "rounded-[20px] bg-white card-shadow p-5"
      )}
    >
      <p
        className={cn(
          "font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5",
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        <CalendarClock className="w-3.5 h-3.5" />
        How to book here
      </p>

      {hasPhone && (
        <a
          href={`tel:+91${rules.appointmentPhone!.replace(/\D/g, "").slice(-10)}`}
          className={cn(
            "flex items-center gap-3 p-4 bg-brand text-white rounded-2xl hover:bg-brand-dark transition-colors",
            compact && "p-3"
          )}
        >
          <Phone className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Call to book</p>
            <p className="text-sm font-bold">+91 {rules.appointmentPhone!.replace(/\D/g, "").slice(-10)}</p>
          </div>
        </a>
      )}

      <div className="space-y-2 text-sm text-zinc-700">
        {hasAdvance && (
          <p className="flex items-start gap-2">
            <CalendarClock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <span>
              Call at least <strong>{rules.advanceBookingDays}</strong> day
              {rules.advanceBookingDays === 1 ? "" : "s"} before your visit.
            </span>
          </p>
        )}
        {hasWindow && (
          <p className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <span>
              Booking calls accepted{" "}
              <strong>
                {formatTimeRange(rules.bookingCallWindowStart!, rules.bookingCallWindowEnd!)}
              </strong>
            </span>
          </p>
        )}
        {hasInstructions && (
          <p className="flex items-start gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{rules.instructions}</span>
          </p>
        )}
      </div>
    </div>
  );
}

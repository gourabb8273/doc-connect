import { cn } from "@/lib/utils";
import type { AvailabilityStatus } from "@/lib/types";

const config: Record<
  AvailabilityStatus,
  { label: string; dot: string; pill: string; pulse: boolean }
> = {
  available: {
    label: "Available Now",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    pulse: true,
  },
  busy: {
    label: "Busy",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    pulse: false,
  },
  delayed: {
    label: "Delayed",
    dot: "bg-orange-400",
    pill: "bg-orange-50 text-orange-700 ring-orange-200",
    pulse: false,
  },
  on_leave: {
    label: "Not Available Today",
    dot: "bg-slate-400",
    pill: "bg-slate-100 text-slate-500 ring-slate-200",
    pulse: false,
  },
};

interface StatusBadgeProps {
  status: AvailabilityStatus;
  note?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, note, size = "md" }: StatusBadgeProps) {
  const c = config[status];
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-semibold ring-1 rounded-full",
          c.pill,
          size === "sm" && "text-xs px-2 py-0.5",
          size === "md" && "text-xs px-2.5 py-1",
          size === "lg" && "text-sm px-3 py-1.5"
        )}
      >
        <span
          className={cn(
            "rounded-full shrink-0",
            c.dot,
            c.pulse && "animate-pulse",
            size === "sm" && "w-1.5 h-1.5",
            size === "md" && "w-2 h-2",
            size === "lg" && "w-2.5 h-2.5"
          )}
        />
        {c.label}
      </span>
      {note && (
        <span className="text-xs text-slate-500 pl-1 italic">{note}</span>
      )}
    </div>
  );
}

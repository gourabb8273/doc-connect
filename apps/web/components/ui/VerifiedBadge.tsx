import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-bold text-brand bg-brand-light ring-1 ring-brand/20 rounded-full px-2.5 py-0.5",
        className
      )}
    >
      <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
      Verified
    </span>
  );
}

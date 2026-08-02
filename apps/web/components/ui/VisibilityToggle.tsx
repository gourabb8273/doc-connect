"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import type { VisibilitySettings } from "@/lib/visibility";

export type { VisibilitySettings };

interface VisibilityToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function VisibilityToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: VisibilityToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-zinc-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-800">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {checked ? (
          <Eye className="w-4 h-4 text-brand" />
        ) : (
          <EyeOff className="w-4 h-4 text-zinc-300" />
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30",
            checked ? "bg-brand" : "bg-zinc-200",
            disabled && "opacity-40 cursor-not-allowed"
          )}
          style={{ width: "2.75rem", height: "1.5rem" }}
        >
          <span
            className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
            style={{
              width: "1.125rem",
              height: "1.125rem",
              left: checked ? "calc(100% - 1.375rem)" : "0.125rem",
            }}
          />
        </button>
      </div>
    </div>
  );
}

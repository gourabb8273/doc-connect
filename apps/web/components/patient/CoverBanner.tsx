"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Stethoscope,
  Baby,
  Heart,
  HeartPulse,
  Sparkles,
  Activity,
  Brain,
  Ear,
  Eye,
  Smile,
  Dumbbell,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoverDisplay, CoverTheme } from "@/lib/clinic-images";

const THEME_ICONS: Record<CoverTheme["id"], LucideIcon> = {
  general: Stethoscope,
  paeds: Baby,
  gynae: Heart,
  cardio: HeartPulse,
  derma: Sparkles,
  ortho: Activity,
  psych: Brain,
  ent: Ear,
  eye: Eye,
  dental: Smile,
  physio: Dumbbell,
  online: Video,
  default: Stethoscope,
};

function TemplateBackground({
  theme,
  showThemeBadge,
}: {
  theme: CoverTheme;
  showThemeBadge: boolean;
}) {
  const ThemeIcon = THEME_ICONS[theme.id];

  return (
    <>
      <div
        className="absolute inset-0"
        style={{ background: theme.bgStyle }}
        aria-hidden
      />
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/20 rounded-full blur-3xl" aria-hidden />
      <div className="absolute -bottom-12 -left-8 w-48 h-48 bg-black/10 rounded-full blur-3xl" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <ThemeIcon
        className="absolute right-3 top-1/2 -translate-y-1/2 w-[72px] h-[72px] text-white/15 pointer-events-none"
        strokeWidth={1.25}
        aria-hidden
      />
      {showThemeBadge && (
        <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/25 bg-white/15 text-white">
          {theme.label}
        </span>
      )}
    </>
  );
}

interface CoverBannerProps {
  cover: CoverDisplay;
  alt: string;
  className?: string;
  imageClassName?: string;
  showThemeBadge?: boolean;
  children?: React.ReactNode;
}

export function CoverBanner({
  cover,
  alt,
  className,
  imageClassName,
  showThemeBadge = true,
  children,
}: CoverBannerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const useTemplate =
    !cover.isCustomPhoto || !cover.displayUrl || imageFailed;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {useTemplate ? (
        <TemplateBackground theme={cover.theme} showThemeBadge={showThemeBadge} />
      ) : (
        <>
          <Image
            src={cover.displayUrl!}
            alt=""
            fill
            role="presentation"
            className={cn(
              "object-cover transition-transform duration-500",
              imageClassName
            )}
            unoptimized
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/5" />
        </>
      )}

      {children}
    </div>
  );
}

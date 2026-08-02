"use client";

import { Suspense, useEffect, useState } from "react";
import { SearchForm } from "@/components/patient/SearchForm";
import { ShieldCheck, Clock, Navigation, Stethoscope, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const USP_ITEMS: { icon: LucideIcon; label: string; hint: string }[] = [
  { icon: Navigation, label: "Nearest first", hint: "By distance and availability" },
  { icon: Clock, label: "Doctor managed", hint: "Status and timings from the doctor" },
  { icon: ShieldCheck, label: "Verified", hint: "Checked before going live" },
];

function UspPill({
  icon: Icon,
  label,
  hint,
  variant = "dark",
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  variant?: "dark" | "light";
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl backdrop-blur-md border transition-colors",
        isDark
          ? "px-3.5 py-2.5 bg-white/10 border-white/15 hover:bg-white/[0.14]"
          : "px-3 py-2 bg-brand-light/80 border-brand/10"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isDark ? "bg-white/15" : "bg-white shadow-sm"
        )}
      >
        <Icon
          className={cn("w-4 h-4", isDark ? "text-white" : "text-brand")}
          strokeWidth={2.5}
        />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-bold leading-tight",
            isDark ? "text-white" : "text-zinc-900"
          )}
        >
          {label}
        </p>
        {hint && (
          <p
            className={cn(
              "text-[10px] leading-snug mt-0.5",
              isDark ? "text-white/55" : "text-zinc-500"
            )}
          >
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

interface HomeHeroProps {
  availableNow: number;
}

export function HomeHero({ availableNow }: HomeHeroProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const progress = Math.min(scrollY / 320, 1);
  const iconRotate = scrollY * 0.08;
  const iconScale = 1 + progress * 0.08;
  const iconY = scrollY * 0.3;
  const iconOpacity = 0.28 - progress * 0.12;
  const heroFade = 1 - progress * 0.45;
  const searchLift = Math.min(scrollY * 0.06, 18);

  return (
    <section className="mesh-dark text-white relative overflow-hidden">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: 0.25 + progress * 0.35 }}
        aria-hidden
      >
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-brand/30 rounded-full blur-[100px]"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        />
        <div
          className="absolute bottom-0 right-10 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"
          style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
        />
      </div>

      <div
        className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14 transition-opacity duration-300"
        style={{ opacity: heroFade }}
      >
        <div className="grid lg:grid-cols-[1fr_17rem] xl:grid-cols-[1fr_19rem] gap-8 lg:gap-10 items-start">
          {/* Left: headline */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {availableNow} available now in Mogra
            </div>

            <h1 className="text-3xl sm:text-[2.75rem] font-extrabold tracking-tight leading-[1.12] mb-3">
              Find a verified doctor
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-orange-300">
                before you step out.
              </span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Know before you go. Availability, clinic, day, and timings managed by the
              doctor, not a directory. Free to search, no account.
            </p>

            {/* Mobile / tablet USP row */}
            <div className="flex flex-wrap gap-2 mt-6 lg:hidden">
              {USP_ITEMS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md"
                >
                  <Icon className="w-3 h-3" strokeWidth={2.5} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RHS: USP stack + doctor icon */}
          <div className="relative hidden lg:block min-h-[15rem]">
            <div
              className="absolute -right-4 top-0 bottom-8 flex items-center justify-center pointer-events-none select-none will-change-transform"
              style={{
                transform: `translateY(${iconY}px) rotate(${iconRotate}deg) scale(${iconScale})`,
                opacity: Math.max(iconOpacity, 0.08),
              }}
              aria-hidden
            >
              <div className="relative">
                <div
                  className="absolute inset-0 bg-brand/20 rounded-full blur-3xl animate-pulse"
                  style={{ animationDuration: "4s" }}
                />
                <div className="w-44 h-44 xl:w-52 xl:h-52 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm flex items-center justify-center">
                  <Stethoscope
                    className="w-20 h-20 xl:w-24 xl:h-24 text-white/25"
                    strokeWidth={1}
                  />
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-2 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-1 pl-0.5">
                Why it works
              </p>
              {USP_ITEMS.map((item) => (
                <UspPill key={item.label} {...item} variant="dark" />
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div
          className="max-w-3xl rounded-[20px] p-4 sm:p-5 shadow-2xl shadow-black/25 transition-all duration-300 mt-8 lg:mt-10"
          style={{
            transform: `translateY(${-searchLift}px)`,
            background: `rgba(255,255,255,${0.97 + progress * 0.03})`,
            boxShadow: `0 24px 48px rgba(0,0,0,${0.18 + progress * 0.12}), 0 0 0 1px rgba(255,255,255,${0.1 + progress * 0.2})`,
          }}
        >
          <Suspense>
            <SearchForm variant="hero" />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

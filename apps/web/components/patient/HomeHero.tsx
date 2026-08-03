"use client";

import { Suspense, useEffect, useState } from "react";
import { SearchForm } from "@/components/patient/SearchForm";
import {
  ShieldCheck,
  Clock,
  Navigation,
  HeartHandshake,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const USP_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Navigation, label: "Nearest first" },
  { icon: Zap, label: "Real time status" },
  { icon: Clock, label: "Doctor managed" },
  { icon: ShieldCheck, label: "Verified" },
];

function UspPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg backdrop-blur-md px-2.5 py-1.5 bg-white/10 border border-white/15">
      <Icon className="w-3.5 h-3.5 text-sky-200 shrink-0" strokeWidth={2.5} />
      <p className="text-[11px] font-bold text-white leading-tight">{label}</p>
    </div>
  );
}


function HeartConnectionBackdrop({
  scrollY,
  progress,
}: {
  scrollY: number;
  progress: number;
}) {
  const drift = scrollY * 0.15;
  const scale = 1 + progress * 0.1 + scrollY * 0.0003;
  const rotate = scrollY * 0.025;

  return (
    <div
      className="absolute inset-0 z-[1] pointer-events-none select-none"
      aria-hidden
    >
      {/* Mobile: top-right, fully inside viewport */}
      <div
        className="absolute sm:hidden hero-heart-float"
        style={{
          top: "3.5rem",
          right: "-1.5rem",
          width: "11rem",
          height: "11rem",
          opacity: Math.max(0.55 - progress * 0.2, 0.38),
        }}
      >
        <div
          className="hero-icon-glow absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.7) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div className="absolute inset-0 rounded-full border border-white/20 hero-ring-expand origin-center" />
        <div
          className="absolute inset-[18%] rounded-full flex items-center justify-center border border-white/25 bg-white/10 backdrop-blur-sm shadow-[0_0_40px_rgba(37,99,235,0.45)]"
        >
          <HeartHandshake className="w-[58%] h-[58%] text-white/70" strokeWidth={1.2} />
        </div>
      </div>

      {/* Desktop: large background on the right */}
      <div
        className="absolute hidden sm:block"
        style={{
          top: "50%",
          right: "3%",
          width: "min(24rem, 58vw)",
          height: "min(24rem, 58vw)",
          transform: `translateY(calc(-50% + ${drift}px)) rotate(${rotate}deg) scale(${scale})`,
          opacity: Math.max(0.62 - progress * 0.22, 0.42),
        }}
      >
        <div className="relative w-full h-full hero-heart-float">
          <div
            className="hero-icon-glow absolute rounded-full"
            style={{
              inset: "10%",
              background: "radial-gradient(circle, rgba(37,99,235,0.65) 0%, transparent 70%)",
              filter: "blur(24px)",
            }}
          />
          <div
            className="hero-heart-float-delay absolute rounded-full"
            style={{
              top: "5%",
              right: "0%",
              width: "55%",
              height: "55%",
              background: "radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="absolute rounded-full border border-white/20 hero-ring-expand origin-center"
            style={{ inset: "0" }}
          />
          <div
            className="absolute rounded-full border border-brand/40 hero-ring-expand-delay origin-center"
            style={{ inset: "8%" }}
          />
          <div
            className="absolute rounded-full border border-white/10"
            style={{ inset: "18%" }}
          />
          <div className="absolute inset-[22%] rounded-full flex items-center justify-center border border-white/20 bg-white/[0.08] backdrop-blur-sm shadow-[0_0_60px_rgba(37,99,235,0.4)]">
            <HeartHandshake
              className="w-[55%] h-[55%] text-white/65 drop-shadow-[0_0_28px_rgba(255,255,255,0.5)]"
              strokeWidth={1.1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface HomeHeroProps {
  availableNow: number;
}

export function HomeHero({ availableNow }: HomeHeroProps) {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Avoid hydration mismatch: server and first client paint use 0 until mounted
  const y = mounted ? scrollY : 0;
  const progress = Math.min(y / 280, 1);
  const heroFade = 1 - progress * 0.35;
  const searchLift = Math.min(y * 0.05, 12);

  return (
    <section className="mesh-dark text-white relative overflow-x-clip min-h-[22rem] sm:min-h-0">
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none z-0"
        style={{ opacity: 0.45 + progress * 0.2 }}
        aria-hidden
      >
        <div
          className="absolute left-1/2 sm:left-8 w-56 h-56 sm:w-72 sm:h-72 bg-brand/40 rounded-full blur-[90px] -translate-x-1/2 sm:translate-x-0"
          style={{ top: `calc(2.5rem + ${y * 0.12}px)` }}
        />
        <div
          className="absolute bottom-0 right-0 sm:right-8 w-64 h-64 sm:w-96 sm:h-96 bg-accent/30 rounded-full blur-[100px]"
          style={{ transform: `translateY(${-y * 0.08}px)` }}
        />
      </div>

      <HeartConnectionBackdrop scrollY={y} progress={progress} />

      <div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-7 transition-opacity duration-500"
        style={{ opacity: heroFade }}
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_9rem] gap-4 items-start">
          <div className="max-w-lg lg:max-w-none">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2.5 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {availableNow} available now in Mogra
            </div>

            <h1 className="text-[1.55rem] sm:text-[2.35rem] font-extrabold tracking-tight leading-[1.15] mb-2">
              Live doctors near you
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-orange-300">
                on a verified network.
              </span>
            </h1>

            <p className="text-zinc-200 text-sm sm:text-[0.9375rem] leading-relaxed max-w-md">
              Real time status, day, and timings from the doctor. Know before you go.
            </p>

            {/* Mobile USP chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 lg:hidden">
              {USP_ITEMS.slice(0, 3).map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/15"
                >
                  <Icon className="w-3 h-3" strokeWidth={2.5} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Desktop USP pills */}
          <div className="hidden lg:flex flex-col gap-1 pt-1 z-10">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
              Our promise
            </p>
            {USP_ITEMS.map((item) => (
              <UspPill key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Search — full width on mobile */}
        <div
          className={cn(
            "relative z-10 w-full sm:max-w-3xl rounded-2xl p-3 sm:p-3.5 mt-4",
            "transition-all duration-500 shadow-2xl shadow-black/20 bg-white/[0.98]"
          )}
          style={{ transform: `translateY(${-searchLift}px)` }}
        >
          <Suspense>
            <SearchForm variant="hero" />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

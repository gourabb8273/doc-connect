"use client";

import { Suspense, useEffect, useState } from "react";
import { SearchForm } from "@/components/patient/SearchForm";
import {
  ShieldCheck,
  Clock,
  Navigation,
  Stethoscope,
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


function DoctorIcon({
  scrollY,
  progress,
}: {
  scrollY: number;
  progress: number;
}) {
  const drift = scrollY * 0.12;
  const rotate = scrollY * 0.025;
  const opacity = Math.max(0.72 - progress * 0.3, 0.38);

  return (
    /* Anchor: vertically centred, right quarter of hero */
    <div
      className="absolute z-[1] pointer-events-none select-none"
      style={{
        top: "50%",
        right: "6%",
        transform: `translateY(calc(-50% + ${drift}px)) rotate(${rotate}deg)`,
        opacity,
      }}
      aria-hidden
    >
      {/* Ambient blue glow blob — behind everything */}
      <div
        className="absolute rounded-full"
        style={{
          width: "26rem",
          height: "26rem",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(circle, rgba(37,99,235,0.45) 0%, transparent 70%)",
          filter: "blur(48px)",
          animation: "hero-orb-float-a 12s ease-in-out infinite",
        }}
      />
      {/* Purple accent glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "18rem",
          height: "18rem",
          top: "50%",
          left: "50%",
          transform: "translate(-30%,-60%)",
          background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "hero-orb-float-c 10s ease-in-out 2s infinite",
        }}
      />

      {/* Outer expanding rings */}
      <div
        className="absolute rounded-full border border-white/18 hero-ring-expand"
        style={{ width: "22rem", height: "22rem", top: "50%", left: "50%", translate: "-50% -50%" }}
      />
      <div
        className="absolute rounded-full border border-brand/35 hero-ring-expand-delay"
        style={{ width: "22rem", height: "22rem", top: "50%", left: "50%", translate: "-50% -50%" }}
      />

      {/* Mid ring — static, subtle */}
      <div
        className="absolute rounded-full border border-white/12"
        style={{ width: "16rem", height: "16rem", top: "50%", left: "50%", translate: "-50% -50%" }}
      />

      {/* Pulsing core glow */}
      <div
        className="hero-icon-glow absolute rounded-full"
        style={{
          width: "10rem",
          height: "10rem",
          top: "50%",
          left: "50%",
          translate: "-50% -50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.7) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Glass disc with stethoscope */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: "10rem",
          height: "10rem",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 50%, rgba(37,99,235,0.22) 100%)",
          boxShadow:
            "0 0 0 1.5px rgba(255,255,255,0.3), 0 8px 40px rgba(37,99,235,0.55), inset 0 1px 0 rgba(255,255,255,0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Stethoscope
          className="text-white/90 drop-shadow-[0_0_32px_rgba(255,255,255,0.55)]"
          style={{ width: "4.5rem", height: "4.5rem" }}
          strokeWidth={1.15}
        />
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

  const progress = Math.min(scrollY / 280, 1);
  const heroFade = 1 - progress * 0.35;
  const searchLift = Math.min(scrollY * 0.05, 12);

  return (
    <section className="hero-section text-white relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div
          className="hero-orb hero-orb-b absolute opacity-40 scale-90"
          style={{ top: "1rem", left: "-5rem", transform: `translateY(${scrollY * 0.08}px)` }}
        />
        <div
          className="hero-orb hero-orb-a absolute opacity-30 scale-75"
          style={{ bottom: "-2rem", left: "30%", transform: `translateY(${-scrollY * 0.06}px)` }}
        />
      </div>

      {/* Big centred doctor icon — right half of hero */}
      <DoctorIcon scrollY={scrollY} progress={progress} />

      <div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-7 transition-opacity duration-500"
        style={{ opacity: heroFade }}
      >
        {/* Two-col: text left, USP pills right */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_9rem] gap-4 items-start">
          <div className="max-w-lg">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-[11px] font-bold px-2.5 py-1 rounded-full mb-2.5 backdrop-blur-md border border-white/10">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {availableNow} available now in Mogra
            </div>

            <h1 className="text-[1.6rem] sm:text-[2.35rem] font-extrabold tracking-tight leading-[1.15] mb-1.5">
              Find a verified doctor
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-orange-300">
                before you step out.
              </span>
            </h1>

            <p className="text-zinc-200 text-sm leading-snug">
              Real time live updates on availability, day, time and location from doctor.
            </p>

            {/* Mobile USP chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 lg:hidden">
              {USP_ITEMS.map(({ icon: Icon, label }) => (
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

        {/* Search */}
        <div
          className={cn(
            "relative z-10 max-w-3xl rounded-2xl p-3 sm:p-3.5 mt-4",
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

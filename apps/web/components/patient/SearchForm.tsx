"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Search,
  MapPin,
  Loader2,
  SlidersHorizontal,
  Calendar,
  Clock,
} from "lucide-react";
import type { TimePeriod } from "@/lib/search";

const SPECIALIZATIONS = [
  "All Specializations",
  "General Physician",
  "Paediatrician",
  "Gynaecologist",
  "Cardiologist",
  "Dermatologist",
  "Orthopaedic Surgeon",
  "Neurologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Psychiatrist",
  "Dentist",
  "Physiotherapist",
];

const DAYS = [
  { value: "", label: "Any day" },
  { value: "today", label: "Today" },
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
  { value: "Sun", label: "Sunday" },
];

const TIMES: { value: "" | TimePeriod; label: string }[] = [
  { value: "", label: "Any time" },
  { value: "morning", label: "Morning (before 12pm)" },
  { value: "afternoon", label: "Afternoon (12–5pm)" },
  { value: "evening", label: "Evening (after 5pm)" },
];

function buildParams(
  query: string,
  spec: string,
  day: string,
  time: string,
  lat?: string,
  lng?: string
) {
  const p = new URLSearchParams();
  if (query.trim()) p.set("q", query.trim());
  if (spec && spec !== "All Specializations") p.set("spec", spec);
  if (day) p.set("day", day);
  if (time) p.set("time", time);
  if (lat) p.set("lat", lat);
  if (lng) p.set("lng", lng);
  return p;
}

export function SearchForm({ variant = "hero" }: { variant?: "hero" | "inline" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [spec, setSpec] = useState(params.get("spec") ?? "");
  const [day, setDay] = useState(params.get("day") ?? "");
  const [time, setTime] = useState(params.get("time") ?? "");
  const [loading, setLoading] = useState(false);

  function navigate(extra?: { lat?: string; lng?: string }) {
    const p = buildParams(query, spec, day, time, extra?.lat, extra?.lng);
    router.push(`/search?${p.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate();
  }

  function handleLocation() {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        navigate({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
      },
      () => setLoading(false)
    );
  }

  const isHero = variant === "hero";
  const fieldClass = isHero
    ? "w-full pl-10 pr-4 py-3 text-sm font-medium text-zinc-700 rounded-xl border-0 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none"
    : "w-full pl-10 pr-4 py-3 text-sm font-medium text-zinc-700 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 appearance-none";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Row 1: location + specialization */}
      <div
        className={
          isHero
            ? "flex flex-col gap-3 p-2 bg-zinc-50 rounded-2xl border border-zinc-200/80"
            : "flex flex-col gap-3"
        }
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pincode or locality, e.g. 700141 Mogra..."
              className={
                isHero
                  ? "w-full pl-11 pr-4 py-3.5 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 rounded-xl border-0 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                  : "w-full pl-11 pr-4 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              }
            />
          </div>

          <div className="relative flex-1 sm:flex-none sm:w-52">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select value={spec} onChange={(e) => setSpec(e.target.value)} className={fieldClass}>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s === "All Specializations" ? "" : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: day + time + search */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 sm:flex-none sm:w-40">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select value={day} onChange={(e) => setDay(e.target.value)} className={fieldClass}>
              {DAYS.map((d) => (
                <option key={d.value || "any"} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass}>
              {TIMES.map((t) => (
                <option key={t.value || "any"} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={
              isHero
                ? "px-8 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-dark shadow-lg shadow-brand/25 transition-all hover:shadow-brand/40 sm:ml-auto"
                : "px-6 py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-dark transition-colors sm:ml-auto"
            }
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick day chips */}
      <div className={`flex flex-wrap gap-2 ${isHero ? "mt-3 ml-1" : "mt-3"}`}>
        {[
          { value: "today", label: "Today" },
          { value: "Mon", label: "Mon" },
          { value: "Tue", label: "Tue" },
          { value: "Wed", label: "Wed" },
          { value: "Thu", label: "Thu" },
          { value: "Fri", label: "Fri" },
          { value: "Sat", label: "Sat" },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setDay(value);
              const p = buildParams(
                query,
                spec,
                value,
                time,
                params.get("lat") ?? undefined,
                params.get("lng") ?? undefined
              );
              router.push(`/search?${p.toString()}`);
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              day === value
                ? "bg-brand text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleLocation}
        disabled={loading}
        className={`flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark disabled:opacity-50 transition-colors ${isHero ? "mt-3 ml-1" : "mt-3"}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4" />
        )}
        Use my current location
      </button>
    </form>
  );
}

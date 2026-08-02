import type { DayOfWeek, Doctor } from "./types";
import { getSessionsForDay, getTodayDay } from "./schedule";

export type TimePeriod = "morning" | "afternoon" | "evening";

export interface SearchFilters {
  q?: string;
  spec?: string;
  day?: string;
  time?: TimePeriod;
  lat?: number;
  lng?: number;
}

const DAY_ORDER: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DAY_LABELS: Record<DayOfWeek, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

const TIME_PERIODS: Record<TimePeriod, { label: string; start: number; end: number }> = {
  morning: { label: "Morning (before 12pm)", start: 6 * 60, end: 12 * 60 },
  afternoon: { label: "Afternoon (12–5pm)", start: 12 * 60, end: 17 * 60 },
  evening: { label: "Evening (after 5pm)", start: 17 * 60, end: 21 * 60 },
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function sessionOverlapsPeriod(
  startTime: string,
  endTime: string,
  period: TimePeriod
): boolean {
  const { start, end } = TIME_PERIODS[period];
  const sessionStart = timeToMinutes(startTime);
  const sessionEnd = timeToMinutes(endTime);
  return sessionStart < end && sessionEnd > start;
}

export function resolveSearchDay(day?: string): DayOfWeek | null {
  if (!day || day === "any") return null;
  if (day === "today") return getTodayDay();
  if (DAY_ORDER.includes(day as DayOfWeek)) return day as DayOfWeek;
  return null;
}

export function doctorMatchesDayTime(
  doctor: Doctor,
  day?: string,
  time?: TimePeriod
): boolean {
  const resolvedDay = resolveSearchDay(day);
  if (!resolvedDay && !time) return true;

  const daysToCheck: DayOfWeek[] = resolvedDay ? [resolvedDay] : DAY_ORDER;

  for (const d of daysToCheck) {
    const sessions = getSessionsForDay(doctor, d);
    for (const session of sessions) {
      if (!time || sessionOverlapsPeriod(session.startTime, session.endTime, time)) {
        return true;
      }
    }
  }

  return false;
}

function matchesQuery(doctor: Doctor, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    doctor.practiceLocations.some(
      (l) =>
        l.pincode.includes(q) ||
        l.locality.toLowerCase().includes(lower) ||
        l.state.toLowerCase().includes(lower) ||
        l.address.toLowerCase().includes(lower)
    ) ||
    doctor.name.toLowerCase().includes(lower) ||
    doctor.specialization.toLowerCase().includes(lower)
  );
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearestDistanceKm(doctor: Doctor, lat: number, lng: number): number {
  return Math.min(
    ...doctor.practiceLocations.map((l) => haversineKm(lat, lng, l.lat, l.lng))
  );
}

export function filterDoctors(doctors: Doctor[], filters: SearchFilters): Doctor[] {
  return doctors
    .filter((d) => d.status === "verified")
    .filter((d) => !filters.q || matchesQuery(d, filters.q))
    .filter((d) => {
      if (!filters.spec) return true;
      return d.specialization.toLowerCase().includes(filters.spec.toLowerCase());
    })
    .filter((d) => doctorMatchesDayTime(d, filters.day, filters.time));
}

const AVAIL_ORDER = { available: 0, delayed: 1, busy: 2, on_leave: 3 };

export function sortDoctors(doctors: Doctor[], filters: SearchFilters): Doctor[] {
  return [...doctors].sort((a, b) => {
    if (filters.lat != null && filters.lng != null) {
      const distA = nearestDistanceKm(a, filters.lat, filters.lng);
      const distB = nearestDistanceKm(b, filters.lat, filters.lng);
      if (distA !== distB) return distA - distB;
    }
    return AVAIL_ORDER[a.availabilityStatus] - AVAIL_ORDER[b.availabilityStatus];
  });
}

export function formatSearchSummary(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`"${filters.q}"`);
  if (filters.spec) parts.push(filters.spec);
  if (filters.lat != null && filters.lng != null && !filters.q) {
    parts.push("Near your location");
  }
  const day = resolveSearchDay(filters.day);
  if (day) parts.push(filters.day === "today" ? "Today" : DAY_LABELS[day]);
  if (filters.time) parts.push(TIME_PERIODS[filters.time].label.split(" (")[0]!);
  return parts.join(" · ");
}

export function parseSearchFilters(params: {
  q?: string;
  spec?: string;
  day?: string;
  time?: string;
  lat?: string;
  lng?: string;
}): SearchFilters {
  const time =
    params.time === "morning" || params.time === "afternoon" || params.time === "evening"
      ? params.time
      : undefined;

  return {
    q: params.q,
    spec: params.spec,
    day: params.day,
    time,
    lat: params.lat ? parseFloat(params.lat) : undefined,
    lng: params.lng ? parseFloat(params.lng) : undefined,
  };
}

export { DAY_LABELS, TIME_PERIODS };

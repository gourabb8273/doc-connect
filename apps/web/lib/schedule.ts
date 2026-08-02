import type { DayOfWeek, Doctor, PracticeLocation, ScheduleSlot, TodaySession } from "./types";

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

export function getTodayDay(): DayOfWeek {
  return DAY_ORDER[new Date().getDay()]!;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${period}` : `${hour}:${m.toString().padStart(2, "0")}${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDaysShort(days: DayOfWeek[]): string {
  if (days.length === 7) return "Every day";
  if (
    days.length === 5 &&
    ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => days.includes(d as DayOfWeek))
  ) {
    return "Mon–Fri";
  }
  if (days.length === 2) return days.join(" & ");
  if (days.length <= 3) return days.join(", ");
  return `${days[0]}–${days[days.length - 1]}`;
}

function slotForDay(slot: ScheduleSlot, day: DayOfWeek): boolean {
  return slot.days.includes(day);
}

export function getSessionsForDay(
  doctor: Doctor,
  day: DayOfWeek = getTodayDay()
): TodaySession[] {
  const sessions: TodaySession[] = [];

  for (const loc of doctor.practiceLocations) {
    for (const slot of loc.schedule ?? []) {
      if (slotForDay(slot, day)) {
        sessions.push({
          locationName: loc.name,
          locality: loc.locality,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isToday: day === getTodayDay(),
          dayLabel: DAY_LABELS[day],
        });
      }
    }
  }

  return sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function getNextUpcomingSession(doctor: Doctor): TodaySession | null {
  const today = getTodayDay();
  const todayIdx = DAY_ORDER.indexOf(today);

  for (let offset = 0; offset < 7; offset++) {
    const day = DAY_ORDER[(todayIdx + offset) % 7]!;
    const sessions = getSessionsForDay(doctor, day);
    if (sessions.length > 0) {
      return {
        ...sessions[0]!,
        isToday: offset === 0,
        dayLabel: offset === 0 ? "Today" : DAY_LABELS[day],
      };
    }
  }
  return null;
}

export function isSeatingToday(doctor: Doctor): boolean {
  return getSessionsForDay(doctor).length > 0;
}

export function getAvailabilityLabel(doctor: Doctor): string {
  if (doctor.availabilityStatus === "on_leave") return "Not available today";
  if (doctor.availabilityStatus === "busy") return "Busy now";
  if (doctor.availabilityStatus === "delayed") return "Available today (delayed)";

  const todaySessions = getSessionsForDay(doctor);
  if (todaySessions.length > 0 && doctor.availabilityStatus === "available") {
    return "Available today";
  }

  const next = getNextUpcomingSession(doctor);
  if (next && !next.isToday) {
    return `Next: ${next.dayLabel}`;
  }

  return "Available now";
}

export function getLocationScheduleSummary(loc: PracticeLocation): string {
  if (!loc.schedule?.length) return "Schedule not listed";
  return loc.schedule
    .map((s) => `${formatDaysShort(s.days)} · ${formatTimeRange(s.startTime, s.endTime)}`)
    .join(" | ");
}

export function getAllSchedulesGrouped(doctor: Doctor) {
  return doctor.practiceLocations.map((loc) => ({
    location: loc,
    slots: loc.schedule ?? [],
  }));
}

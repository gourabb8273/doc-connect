import type { PracticeLocation } from "./types";

export type CoverThemeId =
  | "general"
  | "paeds"
  | "gynae"
  | "cardio"
  | "derma"
  | "ortho"
  | "psych"
  | "ent"
  | "eye"
  | "dental"
  | "physio"
  | "online"
  | "default";

export interface CoverTheme {
  id: CoverThemeId;
  label: string;
  /** Inline gradient — always renders without relying on Tailwind purge */
  bgStyle: string;
  /** Tailwind gradient for cards without a clinic photo */
  bgGradient: string;
  /** Overlay tint on custom photos */
  gradient: string;
  accent: string;
}

export const COVER_THEMES: Record<CoverThemeId, CoverTheme> = {
  general: {
    id: "general",
    label: "General Care",
    bgStyle: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #3730a3 100%)",
    bgGradient: "from-sky-500 via-blue-600 to-indigo-800",
    gradient: "from-sky-600/90 via-blue-700/80 to-slate-800/90",
    accent: "text-sky-200",
  },
  paeds: {
    id: "paeds",
    label: "Paediatric Care",
    bgStyle: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #e11d48 100%)",
    bgGradient: "from-amber-400 via-orange-500 to-rose-600",
    gradient: "from-amber-500/90 via-orange-500/80 to-rose-600/90",
    accent: "text-amber-100",
  },
  gynae: {
    id: "gynae",
    label: "Women's Health",
    bgStyle: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #a21caf 100%)",
    bgGradient: "from-rose-400 via-pink-500 to-fuchsia-700",
    gradient: "from-rose-500/90 via-pink-600/80 to-fuchsia-700/90",
    accent: "text-rose-100",
  },
  cardio: {
    id: "cardio",
    label: "Heart Care",
    bgStyle: "linear-gradient(135deg, #ef4444 0%, #e11d48 50%, #7f1d1d 100%)",
    bgGradient: "from-red-500 via-rose-600 to-red-900",
    gradient: "from-red-600/90 via-rose-700/80 to-red-900/90",
    accent: "text-red-100",
  },
  derma: {
    id: "derma",
    label: "Skin & Dermatology",
    bgStyle: "linear-gradient(135deg, #2dd4bf 0%, #10b981 50%, #0e7490 100%)",
    bgGradient: "from-teal-400 via-emerald-500 to-cyan-700",
    gradient: "from-teal-500/90 via-emerald-600/80 to-cyan-700/90",
    accent: "text-teal-100",
  },
  ortho: {
    id: "ortho",
    label: "Bone & Joint",
    bgStyle: "linear-gradient(135deg, #64748b 0%, #52525b 50%, #0f172a 100%)",
    bgGradient: "from-slate-500 via-zinc-600 to-slate-900",
    gradient: "from-slate-600/90 via-zinc-700/80 to-slate-900/90",
    accent: "text-slate-200",
  },
  psych: {
    id: "psych",
    label: "Mental Wellness",
    bgStyle: "linear-gradient(135deg, #8b5cf6 0%, #9333ea 50%, #312e81 100%)",
    bgGradient: "from-violet-500 via-purple-600 to-indigo-900",
    gradient: "from-violet-600/90 via-purple-700/80 to-indigo-900/90",
    accent: "text-violet-100",
  },
  ent: {
    id: "ent",
    label: "ENT Care",
    bgStyle: "linear-gradient(135deg, #06b6d4 0%, #0284c7 50%, #1e3a8a 100%)",
    bgGradient: "from-cyan-500 via-sky-600 to-blue-900",
    gradient: "from-cyan-600/90 via-sky-700/80 to-blue-900/90",
    accent: "text-cyan-100",
  },
  eye: {
    id: "eye",
    label: "Eye Care",
    bgStyle: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 50%, #5b21b6 100%)",
    bgGradient: "from-blue-500 via-indigo-600 to-violet-800",
    gradient: "from-blue-500/90 via-indigo-600/80 to-violet-800/90",
    accent: "text-blue-100",
  },
  dental: {
    id: "dental",
    label: "Dental Care",
    bgStyle: "linear-gradient(135deg, #38bdf8 0%, #06b6d4 50%, #0f766e 100%)",
    bgGradient: "from-sky-400 via-cyan-500 to-teal-700",
    gradient: "from-sky-500/90 via-cyan-600/80 to-teal-800/90",
    accent: "text-sky-100",
  },
  physio: {
    id: "physio",
    label: "Physiotherapy",
    bgStyle: "linear-gradient(135deg, #84cc16 0%, #16a34a 50%, #065f46 100%)",
    bgGradient: "from-lime-500 via-green-600 to-emerald-800",
    gradient: "from-lime-600/90 via-green-700/80 to-emerald-900/90",
    accent: "text-lime-100",
  },
  online: {
    id: "online",
    label: "Online Consult",
    bgStyle: "linear-gradient(135deg, #8b5cf6 0%, #2563eb 50%, #1e3a8a 100%)",
    bgGradient: "from-violet-500 via-brand to-blue-900",
    gradient: "from-violet-600/90 via-brand/80 to-blue-900/90",
    accent: "text-violet-100",
  },
  default: {
    id: "default",
    label: "Healthcare",
    bgStyle: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #0f172a 100%)",
    bgGradient: "from-brand via-blue-600 to-slate-900",
    gradient: "from-brand/90 via-blue-700/80 to-slate-900/90",
    accent: "text-blue-100",
  },
};

export function resolveCoverTheme(specialization: string): CoverThemeId {
  const s = specialization.toLowerCase();
  if (s.includes("paediat") || s.includes("pediat") || s.includes("child"))
    return "paeds";
  if (s.includes("gynae") || s.includes("obstet")) return "gynae";
  if (s.includes("cardio") || s.includes("heart")) return "cardio";
  if (s.includes("derma") || s.includes("skin")) return "derma";
  if (s.includes("ortho") || s.includes("bone") || s.includes("joint"))
    return "ortho";
  if (s.includes("psych") || s.includes("mental")) return "psych";
  if (s.includes("ent")) return "ent";
  if (s.includes("ophthal") || s.includes("eye")) return "eye";
  if (s.includes("dent")) return "dental";
  if (s.includes("physio")) return "physio";
  if (s.includes("general") || s.includes("physician")) return "general";
  return "default";
}

export function isValidCoverUrl(url?: string | null): url is string {
  if (!url?.trim()) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/");
}

export interface CoverDisplay {
  /** Custom clinic photo URL — empty when using category gradient */
  displayUrl: string | null;
  theme: CoverTheme;
  /** True when doctor uploaded their own clinic/cover photo */
  isCustomPhoto: boolean;
}

export function getDoctorCover(doctor: {
  specialization: string;
  practiceLocations: PracticeLocation[];
}): CoverDisplay {
  for (const loc of doctor.practiceLocations) {
    if (isValidCoverUrl(loc.imageUrl)) {
      const theme = COVER_THEMES[resolveCoverTheme(doctor.specialization)];
      return { displayUrl: loc.imageUrl, theme, isCustomPhoto: true };
    }
  }

  const themeId =
    doctor.practiceLocations.some((l) => l.consultationType === "online") &&
    doctor.practiceLocations.every((l) => l.consultationType === "online")
      ? "online"
      : resolveCoverTheme(doctor.specialization);

  const theme = COVER_THEMES[themeId];
  return { displayUrl: null, theme, isCustomPhoto: false };
}

export function getClinicCover(
  location: PracticeLocation,
  specialization: string
): CoverDisplay {
  if (location.consultationType === "online") {
    const theme = COVER_THEMES.online;
    return { displayUrl: null, theme, isCustomPhoto: false };
  }

  if (isValidCoverUrl(location.imageUrl)) {
    const theme = COVER_THEMES[resolveCoverTheme(specialization)];
    return { displayUrl: location.imageUrl, theme, isCustomPhoto: true };
  }

  const theme = COVER_THEMES[resolveCoverTheme(specialization)];
  return { displayUrl: null, theme, isCustomPhoto: false };
}

/** @deprecated use getDoctorCover */
export function getDoctorCoverImage(locations: PracticeLocation[]): string | null {
  for (const loc of locations) {
    if (loc.imageUrl) return loc.imageUrl;
  }
  return null;
}

/** @deprecated use getClinicCover */
export function getClinicImage(loc: PracticeLocation): string | null {
  return loc.imageUrl ?? null;
}

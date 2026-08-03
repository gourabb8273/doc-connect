export type DoctorTitle = "dr" | "prof" | "dr_prof" | "none";

export const DOCTOR_TITLE_OPTIONS: { value: DoctorTitle; label: string }[] = [
  { value: "dr", label: "Dr." },
  { value: "prof", label: "Prof." },
  { value: "dr_prof", label: "Dr. & Prof." },
  { value: "none", label: "No title" },
];

/** Build public display name from title + bare name (e.g. Dr. + Ratul Roy). */
export function formatDoctorDisplayName(
  title: DoctorTitle | string | undefined,
  name: string
): string {
  const bare = normalizeBareName(name);
  if (!bare) return "";

  switch (title) {
    case "dr":
      return `Dr. ${bare}`;
    case "prof":
      return `Prof. ${bare}`;
    case "dr_prof":
      return `Dr. Prof. ${bare}`;
    default:
      return bare;
  }
}

/** Strip common title prefixes user may have typed in the name field. */
export function normalizeBareName(name: string | undefined | null): string {
  if (!name) return "";
  return name
    .trim()
    .replace(/^(dr\.?\s*)?(prof\.?\s*)?/i, "")
    .replace(/^(prof\.?\s*)(dr\.?\s*)?/i, "")
    .trim();
}

/** Prefer title + bare name; fall back to stored name for older records. */
export function getDoctorDisplayName(doctor: {
  name: string;
  title?: DoctorTitle | string;
}): string {
  if (doctor.title && doctor.title !== "none") {
    return formatDoctorDisplayName(doctor.title as DoctorTitle, doctor.name);
  }
  return doctor.name.trim();
}

export interface VisibilitySettings {
  showPhone: boolean;
  showFee: boolean;
  showExactAddress: boolean;
  showAvailabilityNote: boolean;
}

export const DEFAULT_VISIBILITY: VisibilitySettings = {
  showPhone: false,
  showFee: false,
  showExactAddress: false,
  showAvailabilityNote: false,
};

/** Build full council registration ID, e.g. WBMC-2010-16234 */
export function buildRegistrationNumber(
  council: string,
  regYear: string,
  regSerial: string
): string {
  const serial = regSerial.trim().replace(/^0+/, "") || regSerial.trim();
  return `${council.trim()}-${regYear.trim()}-${serial}`;
}

export function resolveSpecialization(
  specialization: string,
  specializationOther: string
): string {
  if (specialization === "Other") {
    return specializationOther.trim();
  }
  return specialization;
}

/** Whether a delayed/running-late note should show on public profile */
export function publicAvailabilityNote(
  note: string | undefined,
  showNote: boolean | undefined
): string | undefined {
  if (!showNote || !note) return undefined;
  return note;
}

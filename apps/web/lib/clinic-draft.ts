import type { AppointmentRules, ScheduleSlot } from "@/lib/types";
import { DEFAULT_SLOT } from "@/components/doctor/ScheduleSlotEditor";

/** In-memory clinic while doctor fills onboarding (before upload/submit). */
export interface ClinicDraft {
  id: string;
  name: string;
  address: string;
  locality: string;
  pincode: string;
  state: string;
  consultType: "In-person" | "Online" | "Both";
  appointmentPhone: string;
  scheduleSlots: ScheduleSlot[];
  advanceBookingDays: string;
  bookingCallWindowStart: string;
  bookingCallWindowEnd: string;
  instructions: string;
  showAppointmentPhone: boolean;
  coverPreview: string | null;
  coverFile: File | null;
}

export function emptyClinic(state = "West Bengal"): ClinicDraft {
  return {
    id: `clinic-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    address: "",
    locality: "",
    pincode: "",
    state,
    consultType: "In-person",
    appointmentPhone: "",
    scheduleSlots: [{ ...DEFAULT_SLOT }],
    advanceBookingDays: "",
    bookingCallWindowStart: "",
    bookingCallWindowEnd: "",
    instructions: "",
    showAppointmentPhone: true,
    coverPreview: null,
    coverFile: null,
  };
}

export function clinicDraftToAppointmentRules(clinic: ClinicDraft): AppointmentRules {
  return {
    appointmentPhone: clinic.appointmentPhone
      ? `+91${clinic.appointmentPhone.replace(/\D/g, "").slice(-10)}`
      : undefined,
    advanceBookingDays: clinic.advanceBookingDays
      ? parseInt(clinic.advanceBookingDays, 10)
      : undefined,
    bookingCallWindowStart: clinic.bookingCallWindowStart || undefined,
    bookingCallWindowEnd: clinic.bookingCallWindowEnd || undefined,
    instructions: clinic.instructions.trim() || undefined,
    showAppointmentPhone: clinic.showAppointmentPhone,
  };
}

export function isClinicDraftValid(clinic: ClinicDraft): boolean {
  const base =
    clinic.name.trim().length > 0 &&
    clinic.address.trim().length > 0 &&
    clinic.locality.trim().length > 0 &&
    clinic.pincode.length >= 6 &&
    clinic.state.trim().length > 0 &&
    !!clinic.consultType;

  const scheduleOk = clinic.scheduleSlots.some(
    (s) =>
      s.days.length > 0 &&
      s.startTime &&
      s.endTime &&
      s.startTime < s.endTime
  );

  return base && scheduleOk;
}

export function draftFromPracticeLocation(loc: {
  name: string;
  address: string;
  locality: string;
  pincode: string;
  state: string;
  consultationType: string;
  schedule?: ScheduleSlot[];
  imageUrl?: string;
  appointmentRules?: AppointmentRules;
}): ClinicDraft {
  const rules = loc.appointmentRules;
  const consultType =
    loc.consultationType === "online"
      ? "Online"
      : loc.consultationType === "both"
        ? "Both"
        : "In-person";

  return {
    id: `clinic-${Date.now().toString(36)}`,
    name: loc.name,
    address: loc.address,
    locality: loc.locality,
    pincode: loc.pincode,
    state: loc.state,
    consultType,
    appointmentPhone: rules?.appointmentPhone?.replace(/^\+91/, "") ?? "",
    scheduleSlots: loc.schedule?.length ? loc.schedule : [{ ...DEFAULT_SLOT }],
    advanceBookingDays:
      rules?.advanceBookingDays != null ? String(rules.advanceBookingDays) : "",
    bookingCallWindowStart: rules?.bookingCallWindowStart ?? "",
    bookingCallWindowEnd: rules?.bookingCallWindowEnd ?? "",
    instructions: rules?.instructions ?? "",
    showAppointmentPhone: rules?.showAppointmentPhone ?? true,
    coverPreview: loc.imageUrl ?? null,
    coverFile: null,
  };
}

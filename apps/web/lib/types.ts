export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface ScheduleSlot {
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
}

/** How patients should book — call window, advance notice, appointment line, etc. */
export interface AppointmentRules {
  /** Dedicated number for booking calls (may differ from login phone) */
  appointmentPhone?: string;
  /** Minimum days before visit to call/book (e.g. 1 = call one day before) */
  advanceBookingDays?: number;
  /** Daily window when patient should call, e.g. 17:00 */
  bookingCallWindowStart?: string;
  bookingCallWindowEnd?: string;
  /** Free-text rules: token system, max patients, etc. */
  instructions?: string;
  /** Show appointment phone on public profile (separate from login phone toggle) */
  showAppointmentPhone?: boolean;
}

export interface PracticeLocation {
  name: string;
  address: string;
  locality: string;
  pincode: string;
  state: string;
  lat: number;
  lng: number;
  consultationType: ConsultationType;
  schedule: ScheduleSlot[];
  imageUrl?: string;
  /** Per-clinic booking phone, call window, and rules */
  appointmentRules?: AppointmentRules;
}

export type AvailabilityStatus = "available" | "busy" | "delayed" | "on_leave";
export type DoctorStatus = "pending" | "verified" | "rejected" | "suspended";
export type ConsultationType = "in_person" | "online" | "both";
export type DoctorTitle = "dr" | "prof" | "dr_prof" | "none";

export interface DoctorVisibility {
  showPhone: boolean;
  showFee: boolean;
  showExactAddress: boolean;
  showBio: boolean;
  showLanguages: boolean;
  showAvailabilityNote: boolean;
}

export type DocumentType =
  | "photo"
  | "registration_cert"
  | "degree"
  | "govt_id"
  | "selfie"
  | "clinic_cover";

export interface DoctorDocument {
  type: DocumentType;
  url: string;
  fileName?: string;
  mimeType?: string;
  uploadedAt: string;
}

export interface VerificationHistoryEntry {
  action: "submitted" | "approved" | "rejected" | "resubmitted" | "note";
  by?: string;
  note?: string;
  screenshotUrl?: string;
  at: string;
}

export interface DoctorConsents {
  termsAccepted: boolean;
  dataSharingAccepted: boolean;
  verificationAccepted: boolean;
  acceptedAt: string;
}

/** Raw registration fields from onboarding Step 1 (preserved alongside composed number). */
export interface RegistrationMeta {
  council: string;
  regYear: string;
  regSerial: string;
}

/** Snapshot of each onboarding step at submit time — audit-friendly, survives form changes. */
export interface OnboardingProgress {
  completedSteps: number[];
  step1?: {
    title?: DoctorTitle;
    name: string;
    council: string;
    regYear: string;
    regSerial: string;
    specialization: string;
    yearsOfExperience?: number;
  };
  step2?: {
    uploadedTypes: DocumentType[];
  };
  step3?: {
    clinicCount: number;
    clinics: {
      name: string;
      locality: string;
      consultationType: ConsultationType;
      scheduleSlotCount: number;
      hasClinicCover: boolean;
    }[];
  };
  step4?: {
    visibility: DoctorVisibility;
    consultationFee?: number;
    bio?: string;
    consentsAccepted: boolean;
  };
  submittedAt: string;
}

export interface Doctor {
  id: string;
  phone: string;
  /** Bare name without title prefix — use formatDoctorDisplayName(title, name) for display */
  name: string;
  title?: DoctorTitle;
  photoUrl: string;
  registrationNumber: string;
  stateMedicalCouncil: string;
  specialization: string;
  yearsOfExperience: number;
  status: DoctorStatus;
  availabilityStatus: AvailabilityStatus;
  availabilityNote?: string;
  practiceLocations: PracticeLocation[];
  visibility: DoctorVisibility;
  consultationFee?: number;
  bio?: string;
  languages?: string[];
  qualifications?: string[];
  documents?: DoctorDocument[];
  appointmentRules?: AppointmentRules;
  verificationHistory?: VerificationHistoryEntry[];
  rejectionReason?: string;
  consents?: DoctorConsents;
  registrationMeta?: RegistrationMeta;
  onboardingProgress?: OnboardingProgress;
  submittedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminRecord {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: "admin" | "superadmin";
  createdAt: string;
  lastLoginAt?: string;
}

export interface OtpRecord {
  phone: string;
  codeHash?: string;
  reqId?: string;
  purpose: "doctor_login" | "doctor_signup";
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface VerificationAuditRecord {
  id: string;
  doctorId: string;
  adminId?: string;
  action: "submitted" | "approved" | "rejected" | "note";
  registrationNumber: string;
  note?: string;
  rejectionReason?: string;
  wmbcScreenshotUrl?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: "admin" | "superadmin";
}

export interface VerificationRequest {
  doctorId: string;
  doctor: Doctor;
  submittedAt: string;
  documents: {
    type: "registration_cert" | "degree" | "govt_id" | "selfie" | "photo";
    url: string;
    name: string;
  }[];
}

export interface TodaySession {
  locationName: string;
  locality: string;
  startTime: string;
  endTime: string;
  isToday: boolean;
  dayLabel: string;
}

export type AnalyticsEventType =
  | "page_view"
  | "search"
  | "doctor_profile_view";

export type AnalyticsDevice = "mobile" | "tablet" | "desktop" | "bot" | "unknown";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  path: string;
  query?: string;
  sessionId: string;
  userAgent: string;
  device: AnalyticsDevice;
  referrer?: string;
  doctorId?: string;
  /** SHA-256 prefix of IP — for rough unique-visitor counts, not PII */
  ipHash?: string;
  country?: string;
  metadata?: Record<string, string | number | boolean>;
  createdAt: Date;
}

/** Pre-aggregated daily rollups — populated by a future cron/job */
export interface AnalyticsDailySummary {
  date: string; // YYYY-MM-DD UTC
  pageViews: number;
  uniqueSessions: number;
  topPaths: { path: string; count: number }[];
  devices: { device: AnalyticsDevice; count: number }[];
  updatedAt: string;
}

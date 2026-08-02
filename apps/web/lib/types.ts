export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface ScheduleSlot {
  days: DayOfWeek[];
  startTime: string;
  endTime: string;
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
}

export type AvailabilityStatus = "available" | "busy" | "delayed" | "on_leave";
export type DoctorStatus = "pending" | "verified" | "rejected" | "suspended";
export type ConsultationType = "in_person" | "online" | "both";

export interface DoctorVisibility {
  showPhone: boolean;
  showFee: boolean;
  showExactAddress: boolean;
  showBio: boolean;
  showLanguages: boolean;
  showAvailabilityNote: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  photoUrl: string;
  phone: string;
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
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
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

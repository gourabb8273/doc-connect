import doctorsJson from "@/data/doctors.json";
import type { Doctor, DoctorStatus } from "@/lib/types";
import { isDbConfigured } from "@/lib/db/client";
import {
  findAllDoctors,
  findDoctorById,
  findDoctorsByStatus,
} from "@/lib/db/doctors-repository";

const mockDoctors = doctorsJson as Doctor[];

export async function getAllDoctors(): Promise<Doctor[]> {
  if (!isDbConfigured()) return mockDoctors;
  const doctors = await findAllDoctors();
  return doctors.length > 0 ? doctors : mockDoctors;
}

export async function getVerifiedDoctors(): Promise<Doctor[]> {
  const doctors = await getAllDoctors();
  return doctors.filter((d) => d.status === "verified");
}

export async function getDoctorsByStatus(status: DoctorStatus): Promise<Doctor[]> {
  if (!isDbConfigured()) return mockDoctors.filter((d) => d.status === status);
  const doctors = await findDoctorsByStatus(status);
  if (doctors.length === 0 && status === "verified") {
    return mockDoctors.filter((d) => d.status === status);
  }
  return doctors;
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  if (!isDbConfigured()) {
    return mockDoctors.find((d) => d.id === id) ?? null;
  }
  const doctor = await findDoctorById(id);
  return doctor ?? mockDoctors.find((d) => d.id === id) ?? null;
}

import type { Doctor, DoctorStatus } from "@/lib/types";
import { getDb } from "./client";
import { COLLECTIONS } from "./collections";

export async function findAllDoctors(): Promise<Doctor[]> {
  const db = await getDb();
  if (!db) return [];
  return db.collection<Doctor>(COLLECTIONS.doctors).find({}).sort({ name: 1 }).toArray();
}

export async function findDoctorsByStatus(status: DoctorStatus): Promise<Doctor[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<Doctor>(COLLECTIONS.doctors)
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findDoctorById(id: string): Promise<Doctor | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection<Doctor>(COLLECTIONS.doctors).findOne({ id });
}

export async function findDoctorByPhone(phone: string): Promise<Doctor | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection<Doctor>(COLLECTIONS.doctors).findOne({ phone });
}

export async function createDoctor(doctor: Doctor): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not configured");
  await db.collection<Doctor>(COLLECTIONS.doctors).insertOne(doctor);
}

export async function updateDoctor(id: string, patch: Partial<Doctor>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .collection<Doctor>(COLLECTIONS.doctors)
    .updateOne({ id }, { $set: { ...patch, updatedAt: new Date().toISOString() } });
  return result.matchedCount > 0;
}

export async function upsertDoctors(doctors: Doctor[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not configured");

  const collection = db.collection<Doctor>(COLLECTIONS.doctors);
  let count = 0;

  for (const doctor of doctors) {
    await collection.updateOne({ id: doctor.id }, { $set: doctor }, { upsert: true });
    count++;
  }

  return count;
}

import { getDb } from "@/lib/db/client";
import { COLLECTIONS } from "@/lib/db/collections";
import type { VerificationAuditRecord } from "@/lib/types";

export async function createVerificationAudit(
  record: VerificationAuditRecord
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not configured");
  await db.collection<VerificationAuditRecord>(COLLECTIONS.verificationAudit).insertOne(record);
}

export async function listAuditForDoctor(doctorId: string): Promise<VerificationAuditRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .collection<VerificationAuditRecord>(COLLECTIONS.verificationAudit)
    .find({ doctorId })
    .sort({ createdAt: -1 })
    .toArray();
}

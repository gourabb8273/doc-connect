import { getDb } from "./client";
import { COLLECTIONS } from "./collections";

export async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const doctors = db.collection(COLLECTIONS.doctors);
  await doctors.createIndex({ id: 1 }, { unique: true });
  await doctors.createIndex({ status: 1 });
  await doctors.createIndex({ phone: 1 }, { unique: true, sparse: true });
  await doctors.createIndex(
    { registrationNumber: 1, stateMedicalCouncil: 1 },
    { unique: true }
  );

  const admins = db.collection(COLLECTIONS.admins);
  await admins.createIndex({ username: 1 }, { unique: true });

  const otps = db.collection(COLLECTIONS.otps);
  await otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await otps.createIndex({ phone: 1, purpose: 1 });

  const audit = db.collection(COLLECTIONS.verificationAudit);
  await audit.createIndex({ doctorId: 1, createdAt: -1 });

  const analytics = db.collection(COLLECTIONS.analyticsEvents);
  await analytics.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
  await analytics.createIndex({ type: 1, createdAt: -1 });
  await analytics.createIndex({ path: 1, createdAt: -1 });
  await analytics.createIndex({ sessionId: 1, createdAt: -1 });

  const analyticsDaily = db.collection(COLLECTIONS.analyticsDaily);
  await analyticsDaily.createIndex({ date: 1 }, { unique: true });
}

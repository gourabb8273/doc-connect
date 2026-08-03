import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/client";
import { COLLECTIONS } from "@/lib/db/collections";
import type { OtpRecord } from "@/lib/types";
import { isSmsDevMode, isWidgetOtpMode, isMsg91ManagedMode } from "@/lib/sms";
import { sendWidgetOtp, verifyWidgetOtp, verifyWidgetAccessToken } from "@/lib/sms/widget-otp";
import { sendManagedOtp, verifyManagedOtp } from "@/lib/sms/msg91-managed-otp";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtp(): string {
  if (isSmsDevMode()) return "123456";
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(phone: string, purpose: OtpRecord["purpose"]): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not configured");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

  if (isWidgetOtpMode()) {
    const reqId = await sendWidgetOtp(phone);
    await saveOtpRecord(db, { phone, reqId, purpose, attempts: 0, createdAt: now, expiresAt });
    return "";
  }

  if (isMsg91ManagedMode()) {
    const requestId = await sendManagedOtp(phone);
    await saveOtpRecord(db, {
      phone,
      reqId: requestId,
      purpose,
      attempts: 0,
      createdAt: now,
      expiresAt,
    }).catch((err) => {
      console.warn("[OTP] MongoDB save failed after MSG91 send:", err);
    });
    return "";
  }

  const code = generateOtp();
  await saveOtpRecord(db, {
    phone,
    codeHash: await bcrypt.hash(code, 10),
    purpose,
    attempts: 0,
    createdAt: now,
    expiresAt,
  });

  return code;
}

async function saveOtpRecord(
  db: Awaited<ReturnType<typeof getDb>>,
  record: OtpRecord
): Promise<void> {
  if (!db) return;
  await db.collection<OtpRecord>(COLLECTIONS.otps).deleteMany({ phone: record.phone, purpose: record.purpose });
  await db.collection<OtpRecord>(COLLECTIONS.otps).insertOne(record);
}

export async function verifyOtp(
  phone: string,
  code: string,
  purpose: OtpRecord["purpose"]
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const record = await db.collection<OtpRecord>(COLLECTIONS.otps).findOne({ phone, purpose });
  if (!record) return false;
  if (record.expiresAt < new Date()) return false;
  if (record.attempts >= MAX_ATTEMPTS) return false;

  if (record.reqId && isMsg91ManagedMode() && !isWidgetOtpMode()) {
    const ok = await verifyManagedOtp(phone, code);
    if (!ok) {
      await incrementAttempts(db, phone, purpose);
      return false;
    }
    await db.collection<OtpRecord>(COLLECTIONS.otps).deleteOne({ phone, purpose });
    return true;
  }

  if (record.reqId && isWidgetOtpMode()) {
    try {
      const accessToken = await verifyWidgetOtp(record.reqId, code);
      await verifyWidgetAccessToken(accessToken);
      await db.collection<OtpRecord>(COLLECTIONS.otps).deleteOne({ phone, purpose });
      return true;
    } catch {
      await incrementAttempts(db, phone, purpose);
      return false;
    }
  }

  if (!record.codeHash) return false;

  const ok = await bcrypt.compare(code, record.codeHash);
  if (!ok) {
    await incrementAttempts(db, phone, purpose);
    return false;
  }

  await db.collection<OtpRecord>(COLLECTIONS.otps).deleteOne({ phone, purpose });
  return true;
}

async function incrementAttempts(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  phone: string,
  purpose: OtpRecord["purpose"]
): Promise<void> {
  await db.collection<OtpRecord>(COLLECTIONS.otps).updateOne(
    { phone, purpose },
    { $inc: { attempts: 1 } }
  );
}

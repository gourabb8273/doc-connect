import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db/client";
import { COLLECTIONS } from "@/lib/db/collections";
import type { AdminRecord, AdminUser } from "@/lib/types";

export async function findAdminByUsername(username: string): Promise<AdminRecord | null> {
  const db = await getDb();
  if (!db) return null;
  return db.collection<AdminRecord>(COLLECTIONS.admins).findOne({ username });
}

export async function verifyAdminPassword(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const admin = await findAdminByUsername(username);
  if (!admin) return null;

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;

  const db = await getDb();
  if (db) {
    await db.collection(COLLECTIONS.admins).updateOne(
      { id: admin.id },
      { $set: { lastLoginAt: new Date().toISOString() } }
    );
  }

  return {
    id: admin.id,
    name: admin.name,
    username: admin.username,
    role: admin.role,
  };
}

export async function upsertAdmin(admin: AdminRecord): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not configured");
  await db.collection<AdminRecord>(COLLECTIONS.admins).updateOne(
    { username: admin.username },
    { $set: admin },
    { upsert: true }
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Seed admin user from env vars.
 * Usage: npm run db:seed-admin
 *
 * Required in .env.local:
 *   ADMIN_USERNAME=admin
 *   ADMIN_PASSWORD=your-secure-password
 */
import { resolve } from "path";
import { hashPassword, upsertAdmin } from "../lib/db/admins-repository";
import { ensureIndexes } from "../lib/db/indexes";
import { getDb, getDbName, isDbConfigured } from "../lib/db/client";
import type { AdminRecord } from "../lib/types";

async function main() {
  if (!isDbConfigured()) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = process.env.ADMIN_NAME ?? "Platform Admin";

  await getDb();
  await ensureIndexes();

  const admin: AdminRecord = {
    id: "admin-001",
    username,
    passwordHash: await hashPassword(password),
    name,
    role: "superadmin",
    createdAt: new Date().toISOString(),
  };

  await upsertAdmin(admin);
  console.log(`Admin seeded in "${getDbName()}": username="${username}"`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

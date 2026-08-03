/**
 * Seed the dev MongoDB database from doctors.json
 * Usage: npm run db:seed
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import type { Doctor } from "../lib/types";
import { getDb, getDbName, isDbConfigured } from "../lib/db/client";
import { upsertDoctors } from "../lib/db/doctors-repository";
import { ensureIndexes } from "../lib/db/indexes";

async function main() {
  if (!isDbConfigured()) {
    console.error("MONGODB_URI is not set. Add it to apps/web/.env.local");
    process.exit(1);
  }

  const jsonPath = resolve(process.cwd(), "data/doctors.json");
  const doctors = JSON.parse(readFileSync(jsonPath, "utf-8")) as Doctor[];

  const db = await getDb();
  if (!db) {
    console.error("Could not connect to MongoDB");
    process.exit(1);
  }

  const count = await upsertDoctors(doctors);
  await ensureIndexes();
  const total = await db.collection("doctors").countDocuments();

  console.log(`Seeded ${count} doctors into "${getDbName()}" (${total} total in collection)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

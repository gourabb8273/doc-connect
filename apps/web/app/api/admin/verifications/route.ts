import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { findDoctorsByStatus } from "@/lib/db/doctors-repository";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await findDoctorsByStatus("pending");
  return NextResponse.json({ pending, count: pending.length });
}

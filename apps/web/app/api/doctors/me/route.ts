import { NextResponse } from "next/server";
import { getDoctorSession } from "@/lib/auth/session";
import { findDoctorByPhone } from "@/lib/db/doctors-repository";

export async function GET() {
  const session = await getDoctorSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doctor = await findDoctorByPhone(session.phone);
  if (!doctor) {
    return NextResponse.json({ doctor: null, hasProfile: false });
  }

  return NextResponse.json({ doctor, hasProfile: true });
}

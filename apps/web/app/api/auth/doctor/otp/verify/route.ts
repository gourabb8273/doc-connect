import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/db/otps-repository";
import { findDoctorByPhone } from "@/lib/db/doctors-repository";
import { signDoctorToken, setDoctorSessionCookie } from "@/lib/auth/session";

const bodySchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
  purpose: z.enum(["doctor_login", "doctor_signup"]).default("doctor_login"),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const phone = body.phone.replace(/\s/g, "");

    const ok = await verifyOtp(phone, body.code, body.purpose);
    if (!ok) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    const doctor = await findDoctorByPhone(phone);

    const token = await signDoctorToken({
      sub: phone,
      phone,
      doctorId: doctor?.id,
    });
    await setDoctorSessionCookie(token);

    return NextResponse.json({
      ok: true,
      doctorId: doctor?.id ?? null,
      hasProfile: Boolean(doctor),
      status: doctor?.status ?? null,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

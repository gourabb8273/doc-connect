import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtp } from "@/lib/db/otps-repository";
import { isMsg91Configured, isSmsDevModeEnv } from "@/lib/env/msg91";
import { sendOtpSms, isMsg91ManagedMode, isWidgetOtpMode } from "@/lib/sms";

const bodySchema = z.object({
  phone: z.string().min(10).max(15),
  purpose: z.enum(["doctor_login", "doctor_signup"]).default("doctor_login"),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const phone = body.phone.replace(/\s/g, "");

    if (!isMsg91Configured()) {
      return NextResponse.json(
        {
          error:
            "MSG91 not configured. Add MSG91_AUTH_KEY to apps/web/.env.local and restart: npm run dev",
        },
        { status: 503 }
      );
    }

    const code = await createOtp(phone, body.purpose);

    if (code && !isMsg91ManagedMode() && !isWidgetOtpMode()) {
      await sendOtpSms(phone, code);
    }

    const devHint = isSmsDevModeEnv() ? { devOtp: code } : undefined;
    const templateMissing =
      isMsg91ManagedMode() &&
      !isWidgetOtpMode() &&
      !(process.env["MSG91_TEMPLATE_ID"] ?? "").trim();

    return NextResponse.json({
      ok: true,
      message: "OTP sent",
      ...(templateMissing
        ? {
            warning:
              "MSG91 accepted the request but MSG91_TEMPLATE_ID is not set. In India, SMS usually will not deliver without an approved DLT OTP template. Add the template ID from MSG91 → OTP → Templates to .env.local.",
          }
        : {}),
      ...devHint,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    console.error(err);
    const message = err instanceof Error ? err.message : "Could not send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

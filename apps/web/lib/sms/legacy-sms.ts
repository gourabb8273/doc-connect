import { getMsg91AuthKey, getMsg91TemplateId, isSmsDevModeEnv } from "@/lib/env/msg91";
import { formatMobile } from "./msg91-managed-otp";

export function isLegacyTemplateOtpMode(): boolean {
  if (isSmsDevModeEnv()) return false;
  return !!(getMsg91AuthKey() && getMsg91TemplateId());
}

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  if (isSmsDevModeEnv()) {
    console.log(`[SMS_DEV] OTP for ${phone}: ${code}`);
    return;
  }

  const authKey = getMsg91AuthKey();
  const templateId = getMsg91TemplateId();
  if (!authKey || !templateId) {
    throw new Error("Legacy OTP requires MSG91_TEMPLATE_ID");
  }

  const mobile = formatMobile(phone);
  const res = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile,
      otp: code,
      otp_length: 6,
      otp_expiry: 10,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MSG91 OTP failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { type?: string; message?: string };
  if (data.type === "error") {
    throw new Error(`MSG91 OTP error: ${data.message ?? "Unknown error"}`);
  }
}

export async function sendDoctorStatusSms(
  phone: string,
  message: string
): Promise<void> {
  if (isSmsDevModeEnv()) {
    console.log(`[SMS_DEV] To ${phone}: ${message}`);
    return;
  }
  console.log(`[SMS] To ${phone}: ${message}`);
}

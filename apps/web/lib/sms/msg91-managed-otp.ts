/**
 * MSG91 managed OTP — MSG91 generates, sends, and verifies the OTP.
 * Works with MSG91_AUTH_KEY only (no template_id or widget token required).
 */

import {
  getMsg91AuthKey,
  getMsg91AuthToken,
  getMsg91WidgetId,
  isSmsDevModeEnv,
} from "@/lib/env/msg91";

const OTP_BASE = "https://control.msg91.com/api/v5/otp";

export function isMsg91ManagedMode(): boolean {
  if (isSmsDevModeEnv()) return false;
  return !!getMsg91AuthKey();
}

export function isWidgetOtpMode(): boolean {
  if (isSmsDevModeEnv()) return false;
  const widgetId = getMsg91WidgetId();
  const token = getMsg91AuthToken();
  const key = getMsg91AuthKey();
  if (!widgetId || !token || !key) return false;
  if (token === key) return false;
  return true;
}

function authKey(): string {
  const key = getMsg91AuthKey();
  if (!key) throw new Error("MSG91_AUTH_KEY is not set in .env.local — restart dev server after editing");
  return key;
}

export function formatMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91")) return digits;
  return `91${digits}`;
}

type Msg91Response = { type?: string; message?: string; request_id?: string };

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = 12_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("MSG91 request timed out — try again");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendManagedOtp(phone: string): Promise<string> {
  const mobile = formatMobile(phone);
  const body: Record<string, unknown> = {
      mobile,
      otp_length: 6,
      otp_expiry: 10,
    };
  const templateId = (process.env["MSG91_TEMPLATE_ID"] ?? "").trim();
  if (templateId) {
    body.template_id = templateId;
  }

  const res = await fetchWithTimeout(OTP_BASE, {
    method: "POST",
    headers: {
      authkey: authKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as Msg91Response;
  if (!res.ok || data.type === "error") {
    throw new Error(`MSG91 send OTP failed: ${data.message ?? JSON.stringify(data)}`);
  }

  const requestId = data.request_id;
  if (!requestId) {
    throw new Error("MSG91 send OTP: missing request_id");
  }
  console.log(`[MSG91] OTP request accepted for ${mobile}, request_id=${requestId}${templateId ? "" : " (no template_id — SMS may not deliver in India without DLT template + wallet balance)"}`);
  return requestId;
}

export async function verifyManagedOtp(phone: string, otp: string): Promise<boolean> {
  const mobile = formatMobile(phone);
  const url = `${OTP_BASE}/verify?mobile=${encodeURIComponent(mobile)}&otp=${encodeURIComponent(otp)}`;

  const res = await fetchWithTimeout(url, {
    method: "GET",
    headers: { authkey: authKey() },
  });

  const data = (await res.json()) as Msg91Response;
  if (!res.ok || data.type === "error") {
    return false;
  }
  return (
    data.type === "success" ||
    data.message === "OTP verified success" ||
    data.message === "number_verified_successfully"
  );
}

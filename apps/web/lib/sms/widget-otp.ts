/**
 * MSG91 OTP Widget API (server-side).
 * Uses widget default SMS template — no separate MSG91_TEMPLATE_ID needed.
 * Docs: https://docs.msg91.com/otp-widget
 */

import { getMsg91AuthKey, getMsg91AuthToken, getMsg91WidgetId } from "@/lib/env/msg91";

const WIDGET_BASE = "https://control.msg91.com/api/v5/widget";

function widgetConfig() {
  const widgetId = getMsg91WidgetId();
  const tokenAuth = getMsg91AuthToken();
  const authKey = getMsg91AuthKey();
  if (!widgetId || !tokenAuth || !authKey) {
    throw new Error(
      "MSG91 widget not configured. Set MSG91_WIDGET_ID, MSG91_AUTH_TOKEN, and MSG91_AUTH_KEY in .env.local"
    );
  }
  return { widgetId, tokenAuth, authKey };
}

export function formatMobileIdentifier(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91")) return digits;
  return `91${digits}`;
}

type Msg91Response = {
  type?: string;
  message?: string;
  reqId?: string;
  access_token?: string;
  "access-token"?: string;
};

function assertSuccess(data: Msg91Response, context: string): void {
  if (data.type === "error") {
    throw new Error(`MSG91 ${context}: ${data.message ?? "Unknown error"}`);
  }
}

/** Send OTP via widget — returns reqId to store for verification */
export async function sendWidgetOtp(phone: string): Promise<string> {
  const { widgetId, tokenAuth } = widgetConfig();
  const identifier = formatMobileIdentifier(phone);

  const res = await fetch(`${WIDGET_BASE}/sendOtpMobile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgetId, tokenAuth, identifier }),
  });

  const data = (await res.json()) as Msg91Response;
  if (!res.ok) {
    throw new Error(`MSG91 send OTP failed (${res.status}): ${data.message ?? JSON.stringify(data)}`);
  }
  assertSuccess(data, "send OTP");

  const reqId = data.reqId ?? data.message;
  if (!reqId) {
    throw new Error("MSG91 send OTP: missing reqId in response");
  }
  return reqId;
}

/** Verify OTP with widget — returns access token for server validation */
export async function verifyWidgetOtp(reqId: string, otp: string): Promise<string> {
  const { widgetId, tokenAuth } = widgetConfig();

  const res = await fetch(`${WIDGET_BASE}/verifyOtp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgetId, tokenAuth, reqId, otp }),
  });

  const data = (await res.json()) as Msg91Response;
  if (!res.ok) {
    throw new Error(`MSG91 verify OTP failed (${res.status}): ${data.message ?? JSON.stringify(data)}`);
  }
  assertSuccess(data, "verify OTP");

  const token = data["access-token"] ?? data.access_token ?? data.message;
  if (!token) {
    throw new Error("MSG91 verify OTP: missing access token in response");
  }
  return token;
}

/** Validate access token with MSG91 (dual verification) */
export async function verifyWidgetAccessToken(accessToken: string): Promise<void> {
  const { authKey } = widgetConfig();

  const res = await fetch(`${WIDGET_BASE}/verifyAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ authkey: authKey, "access-token": accessToken }),
  });

  const data = (await res.json()) as Msg91Response;
  if (!res.ok) {
    throw new Error(`MSG91 token verify failed (${res.status}): ${data.message ?? JSON.stringify(data)}`);
  }
  assertSuccess(data, "access token");
}

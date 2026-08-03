import { randomUUID } from "crypto";
import { cookies } from "next/headers";

export const ANALYTICS_SESSION_COOKIE = "fnd_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getOrCreateAnalyticsSessionId(): Promise<{
  sessionId: string;
  isNew: boolean;
}> {
  const jar = await cookies();
  const existing = jar.get(ANALYTICS_SESSION_COOKIE)?.value;
  if (existing) {
    return { sessionId: existing, isNew: false };
  }

  const sessionId = randomUUID();
  jar.set(ANALYTICS_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return { sessionId, isNew: true };
}

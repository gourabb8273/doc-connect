import { createHash } from "crypto";

export function hashIp(ip: string | null): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.JWT_SECRET ?? "fnd-analytics";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headers.get("x-real-ip");
}

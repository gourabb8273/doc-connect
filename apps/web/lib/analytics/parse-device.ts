import type { AnalyticsDevice } from "@/lib/types";

export function parseDevice(userAgent: string): AnalyticsDevice {
  if (!userAgent) return "unknown";
  if (/bot|crawler|spider|slurp|facebookexternalhit/i.test(userAgent)) return "bot";
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
}

export function isPublicAnalyticsPath(path: string): boolean {
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/doctor")) return false;
  if (path.startsWith("/api")) return false;
  if (path.startsWith("/_next")) return false;
  return true;
}

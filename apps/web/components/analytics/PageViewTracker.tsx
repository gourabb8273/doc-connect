"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function shouldTrack(path: string): boolean {
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/doctor")) return false;
  return true;
}

function eventTypeForPath(path: string): "page_view" | "search" | "doctor_profile_view" {
  if (path.startsWith("/search")) return "search";
  if (path.startsWith("/doctors/")) return "doctor_profile_view";
  return "page_view";
}

function doctorIdFromPath(path: string): string | undefined {
  const match = path.match(/^\/doctors\/([^/?]+)/);
  return match?.[1];
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    if (!pathname || !shouldTrack(pathname)) return;

    const query = searchParams?.toString() ?? "";
    const key = `${pathname}?${query}`;
    if (lastTracked.current === key) return;
    lastTracked.current = key;

    const type = eventTypeForPath(pathname);
    const doctorId = type === "doctor_profile_view" ? doctorIdFromPath(pathname) : undefined;

    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        type,
        path: pathname,
        query: query || undefined,
        doctorId,
      }),
    }).catch(() => {
      /* non-blocking */
    });
  }, [pathname, searchParams]);

  return null;
}

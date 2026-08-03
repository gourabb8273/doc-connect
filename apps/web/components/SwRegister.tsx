"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    // Dev: skip SW — cache-first on /_next/static/ causes hydration mismatches after code changes
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("SW registration failed:", err));
    }
  }, []);

  return null;
}

import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAnalyticsSummary } from "@/lib/db/analytics-repository";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10) || 7));

  const summary = await getAnalyticsSummary(days);
  return NextResponse.json({ ok: true, days, ...summary });
}

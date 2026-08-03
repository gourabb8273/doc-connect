import { NextResponse } from "next/server";
import { z } from "zod";
import { parseDevice, isPublicAnalyticsPath } from "@/lib/analytics/parse-device";
import { getOrCreateAnalyticsSessionId } from "@/lib/analytics/session";
import { clientIpFromHeaders, hashIp } from "@/lib/analytics/ip-hash";
import { recordAnalyticsEvent } from "@/lib/db/analytics-repository";

const bodySchema = z.object({
  type: z.enum(["page_view", "search", "doctor_profile_view"]).default("page_view"),
  path: z.string().min(1).max(500),
  query: z.string().max(500).optional(),
  doctorId: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    if (!isPublicAnalyticsPath(body.path)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const headers = request.headers;
    const userAgent = headers.get("user-agent") ?? "";
    const referrer = headers.get("referer") ?? undefined;
    const country = headers.get("x-country") ?? headers.get("cf-ipcountry") ?? undefined;
    const { sessionId } = await getOrCreateAnalyticsSessionId();

    await recordAnalyticsEvent({
      type: body.type,
      path: body.path,
      query: body.query,
      sessionId,
      userAgent,
      device: parseDevice(userAgent),
      referrer,
      doctorId: body.doctorId,
      ipHash: hashIp(clientIpFromHeaders(headers)),
      country: country || undefined,
      metadata: body.metadata,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    console.error("[analytics]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

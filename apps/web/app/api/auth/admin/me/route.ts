import { NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/auth/session";

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    admin: {
      id: session.sub,
      username: session.username,
      name: session.name,
      role: session.role,
    },
  });
}

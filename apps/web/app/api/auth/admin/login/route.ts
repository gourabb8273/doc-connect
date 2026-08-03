import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminPassword } from "@/lib/db/admins-repository";
import { signAdminToken, setAdminSessionCookie } from "@/lib/auth/session";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const admin = await verifyAdminPassword(body.username, body.password);

    if (!admin) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await signAdminToken({
      sub: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    });
    await setAdminSessionCookie(token);

    return NextResponse.json({ admin });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

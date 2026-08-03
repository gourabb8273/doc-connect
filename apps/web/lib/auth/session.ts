import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "fnd_admin_session";
const DOCTOR_COOKIE = "fnd_doctor_session";

function secret(): Uint8Array {
  const key = process.env.JWT_SECRET ?? "dev-only-change-in-production";
  return new TextEncoder().encode(key);
}

export interface AdminSession {
  sub: string;
  username: string;
  name: string;
  role: "admin" | "superadmin";
  type: "admin";
}

export interface DoctorSession {
  sub: string;
  phone: string;
  doctorId?: string;
  type: "doctor";
}

export async function signAdminToken(payload: Omit<AdminSession, "type">): Promise<string> {
  return new SignJWT({ ...payload, type: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function signDoctorToken(payload: Omit<DoctorSession, "type">): Promise<string> {
  return new SignJWT({ ...payload, type: "doctor" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyToken<T extends AdminSession | DoctorSession>(
  token: string
): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as T;
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setDoctorSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(DOCTOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken<AdminSession>(token);
  return session?.type === "admin" ? session : null;
}

export async function getDoctorSession(): Promise<DoctorSession | null> {
  const jar = await cookies();
  const token = jar.get(DOCTOR_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken<DoctorSession>(token);
  return session?.type === "doctor" ? session : null;
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { findDoctorById, updateDoctor } from "@/lib/db/doctors-repository";
import { createVerificationAudit } from "@/lib/db/verification-audit-repository";
import { sendDoctorStatusSms } from "@/lib/sms";

const bodySchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
  rejectionReason: z.string().optional(),
  wmbcScreenshotUrl: z.string().url().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = bodySchema.parse(await request.json());
    const doctor = await findDoctorById(id);

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (doctor.status !== "pending") {
      return NextResponse.json({ error: "Doctor is not pending review" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (body.action === "reject" && !body.rejectionReason?.trim()) {
      return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
    }

    const newStatus = body.action === "approve" ? "verified" : "rejected";

    await updateDoctor(id, {
      status: newStatus,
      verifiedAt: body.action === "approve" ? now : undefined,
      rejectionReason: body.action === "reject" ? body.rejectionReason : undefined,
      availabilityStatus: body.action === "approve" ? "available" : "on_leave",
      verificationHistory: [
        ...(doctor.verificationHistory ?? []),
        {
          action: body.action === "approve" ? "approved" : "rejected",
          by: session.sub,
          note: body.note,
          screenshotUrl: body.wmbcScreenshotUrl,
          at: now,
        },
      ],
    });

    await createVerificationAudit({
      id: `audit-${Date.now().toString(36)}`,
      doctorId: id,
      adminId: session.sub,
      action: body.action === "approve" ? "approved" : "rejected",
      registrationNumber: doctor.registrationNumber,
      note: body.note,
      rejectionReason: body.rejectionReason,
      wmbcScreenshotUrl: body.wmbcScreenshotUrl,
      createdAt: now,
    });

    const smsMessage =
      body.action === "approve"
        ? `Find Near Doctor: Your profile is verified and now live for patients near you.`
        : `Find Near Doctor: Your application needs changes. Reason: ${body.rejectionReason}`;

    await sendDoctorStatusSms(doctor.phone, smsMessage);

    const updated = await findDoctorById(id);
    return NextResponse.json({ ok: true, doctor: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not update verification" }, { status: 500 });
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const doctor = await findDoctorById(id);
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
  }

  return NextResponse.json({ doctor });
}

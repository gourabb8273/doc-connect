import { NextResponse } from "next/server";
import { z } from "zod";
import { getDoctorSession } from "@/lib/auth/session";
import {
  createDoctor,
  findDoctorByPhone,
  findDoctorById,
  updateDoctor,
} from "@/lib/db/doctors-repository";
import { createVerificationAudit } from "@/lib/db/verification-audit-repository";
import type {
  Doctor,
  DoctorDocument,
  OnboardingProgress,
  PracticeLocation,
  RegistrationMeta,
  AppointmentRules,
  ScheduleSlot,
} from "@/lib/types";

const daySchema = z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

const scheduleSlotSchema = z.object({
  days: z.array(daySchema).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const appointmentRulesSchema = z
  .object({
    appointmentPhone: z.string().min(10).max(15).optional(),
    advanceBookingDays: z.number().min(0).max(30).optional(),
    bookingCallWindowStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    bookingCallWindowEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    instructions: z.string().max(500).optional(),
    showAppointmentPhone: z.boolean().optional(),
  })
  .optional();

const documentSchema = z.object({
  type: z.enum(["photo", "registration_cert", "degree", "govt_id", "selfie", "clinic_cover"]),
  url: z.string().min(1),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  locality: z.string().min(1),
  pincode: z.string().min(6),
  state: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  consultationType: z.enum(["in_person", "online", "both"]),
  imageUrl: z.string().min(1).optional(),
  schedule: z.array(scheduleSlotSchema).min(1),
  appointmentRules: appointmentRulesSchema,
});

const registrationMetaSchema = z.object({
  council: z.string().min(2),
  regYear: z.string().min(4).max(4),
  regSerial: z.string().min(1),
});

import type { DoctorTitle } from "@/lib/types";
import { formatDoctorDisplayName, normalizeBareName } from "@/lib/doctor-name";

const titleSchema = z.enum(["dr", "prof", "dr_prof", "none"]).optional();

const applySchema = z.object({
  title: titleSchema,
  name: z.string().min(2),
  registrationNumber: z.string().min(3),
  stateMedicalCouncil: z.string().min(2),
  specialization: z.string().min(2),
  yearsOfExperience: z.number().min(0).optional(),
  consultationFee: z.number().optional(),
  bio: z.string().optional(),
  registrationMeta: registrationMetaSchema.optional(),
  visibility: z.object({
    showPhone: z.boolean(),
    showFee: z.boolean(),
    showExactAddress: z.boolean(),
    showBio: z.boolean().optional(),
    showLanguages: z.boolean().optional(),
    showAvailabilityNote: z.boolean().optional(),
  }),
  practiceLocations: z.array(locationSchema).min(1),
  documents: z.array(documentSchema).min(2),
  consents: z.object({
    termsAccepted: z.literal(true),
    dataSharingAccepted: z.literal(true),
    verificationAccepted: z.literal(true),
  }),
});

function newDoctorId(): string {
  return `dr-${Date.now().toString(36)}`;
}

function buildOnboardingProgress(
  body: z.infer<typeof applySchema>,
  now: string
): OnboardingProgress {
  const registrationMeta = body.registrationMeta;

  return {
    completedSteps: [1, 2, 3, 4],
    step1: {
      title: body.title,
      name: normalizeBareName(body.name),
      council: registrationMeta?.council ?? body.stateMedicalCouncil,
      regYear: registrationMeta?.regYear ?? "",
      regSerial: registrationMeta?.regSerial ?? "",
      specialization: body.specialization,
      yearsOfExperience: body.yearsOfExperience,
    },
    step2: {
      uploadedTypes: body.documents.map((d) => d.type),
    },
    step3: {
      clinicCount: body.practiceLocations.length,
      clinics: body.practiceLocations.map((loc) => ({
        name: loc.name,
        locality: loc.locality,
        consultationType: loc.consultationType,
        scheduleSlotCount: loc.schedule.length,
        hasClinicCover: !!loc.imageUrl,
      })),
    },
    step4: {
      visibility: {
        showPhone: body.visibility.showPhone,
        showFee: body.visibility.showFee,
        showExactAddress: body.visibility.showExactAddress,
        showBio: body.visibility.showBio ?? true,
        showLanguages: body.visibility.showLanguages ?? false,
        showAvailabilityNote: body.visibility.showAvailabilityNote ?? false,
      },
      consultationFee: body.consultationFee,
      bio: body.bio,
      consentsAccepted: true,
    },
    submittedAt: now,
  };
}

export async function POST(request: Request) {
  const session = await getDoctorSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = applySchema.parse(await request.json());
    const existing = await findDoctorByPhone(session.phone);

    if (existing && existing.status !== "rejected") {
      return NextResponse.json(
        { error: "Application already submitted", doctorId: existing.id, status: existing.status },
        { status: 409 }
      );
    }

    const photoDoc = body.documents.find((d) => d.type === "photo");
    const now = new Date().toISOString();
    const doctorId = existing?.id ?? newDoctorId();

    const practiceLocations: PracticeLocation[] = body.practiceLocations.map((loc) => ({
      name: loc.name,
      address: loc.address,
      locality: loc.locality,
      pincode: loc.pincode,
      state: loc.state,
      lat: loc.lat ?? 22.57,
      lng: loc.lng ?? 88.36,
      consultationType: loc.consultationType,
      schedule: loc.schedule as ScheduleSlot[],
      imageUrl: loc.imageUrl,
      appointmentRules: loc.appointmentRules
        ? {
            ...loc.appointmentRules,
            appointmentPhone: loc.appointmentRules.appointmentPhone?.replace(/\s/g, ""),
          }
        : undefined,
    }));

    const documents: DoctorDocument[] = body.documents.map((d) => ({
      ...d,
      uploadedAt: now,
    }));

    const registrationMeta: RegistrationMeta | undefined = body.registrationMeta
      ? {
          council: body.registrationMeta.council,
          regYear: body.registrationMeta.regYear,
          regSerial: body.registrationMeta.regSerial,
        }
      : undefined;

    const onboardingProgress = buildOnboardingProgress(body, now);

    const bareName = normalizeBareName(body.name);
    const title = body.title ?? "dr";

    const doctor: Doctor = {
      id: doctorId,
      phone: session.phone,
      name: bareName,
      title,
      photoUrl: photoDoc?.url ?? "",
      registrationNumber: body.registrationNumber,
      stateMedicalCouncil: body.stateMedicalCouncil,
      specialization: body.specialization,
      yearsOfExperience: body.yearsOfExperience ?? 0,
      status: "pending",
      availabilityStatus: "on_leave",
      rejectionReason: undefined,
      practiceLocations,
      visibility: {
        showPhone: body.visibility.showPhone,
        showFee: body.visibility.showFee,
        showExactAddress: body.visibility.showExactAddress,
        showBio: body.visibility.showBio ?? true,
        showLanguages: body.visibility.showLanguages ?? false,
        showAvailabilityNote: body.visibility.showAvailabilityNote ?? false,
      },
      consultationFee: body.consultationFee,
      bio: body.bio,
      documents,
      registrationMeta,
      onboardingProgress,
      submittedAt: now,
      verificationHistory: [
        ...(existing?.verificationHistory ?? []),
        { action: existing ? "resubmitted" : "submitted", at: now },
      ],
      consents: { ...body.consents, acceptedAt: now },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (existing) {
      await updateDoctor(existing.id, doctor);
    } else {
      await createDoctor(doctor);
    }

    await createVerificationAudit({
      id: `audit-${Date.now().toString(36)}`,
      doctorId,
      action: "submitted",
      registrationNumber: body.registrationNumber,
      note: existing ? "Application resubmitted after rejection" : "Initial onboarding submission",
      createdAt: now,
    });

    const saved = await findDoctorById(doctorId);
    return NextResponse.json({ ok: true, doctorId, doctor: saved }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid application data", details: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not submit application" }, { status: 500 });
  }
}

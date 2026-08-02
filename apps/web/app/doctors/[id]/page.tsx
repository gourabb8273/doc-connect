import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  IndianRupee,
  GraduationCap,
  Languages,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  MapPin,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ClinicScheduleBlock } from "@/components/patient/ClinicScheduleBlock";
import { SchedulePreview } from "@/components/patient/SchedulePreview";
import doctorsData from "@/data/doctors.json";
import type { Doctor } from "@/lib/types";
import { formatFee } from "@/lib/utils";
import { getAvailabilityLabel, isSeatingToday } from "@/lib/schedule";
import { getDoctorCover } from "@/lib/clinic-images";
import { CoverBanner } from "@/components/patient/CoverBanner";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DoctorProfilePage({ params }: Props) {
  const { id } = await params;
  const doctor = (doctorsData as Doctor[]).find((d) => d.id === id);

  if (!doctor || doctor.status !== "verified") notFound();

  const seatingToday = isSeatingToday(doctor);
  const availLabel = getAvailabilityLabel(doctor);
  const cover = getDoctorCover(doctor);
  const clinicCount = doctor.practiceLocations.filter(
    (l) => l.consultationType !== "online"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Cover hero */}
      <CoverBanner
        cover={cover}
        alt="Clinic cover"
        className="h-52 sm:h-64"
        showThemeBadge={!cover.isCustomPhoto}
      >
        <div className="absolute top-4 left-4 sm:left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {clinicCount > 0 && cover.isCustomPhoto && (
          <span className="absolute top-4 right-4 sm:right-6 text-xs font-bold text-white/90 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl">
            {clinicCount} clinic photo{clinicCount > 1 ? "s" : ""}
          </span>
        )}
      </CoverBanner>

      {/* Profile card overlapping hero */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-20 relative z-10 pb-12">
        <div className="bg-white rounded-[24px] card-shadow overflow-hidden">
          {/* Doctor header */}
          <div className="p-6 sm:p-8 border-b border-zinc-100">
            <div className="flex gap-5 items-start">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] overflow-hidden ring-4 ring-white shadow-xl shrink-0 -mt-16 sm:-mt-20">
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.name}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                    {doctor.name}
                  </h1>
                  <VerifiedBadge />
                </div>
                <p className="text-zinc-600 font-semibold">{doctor.specialization}</p>
                {doctor.yearsOfExperience > 0 && (
                  <p className="text-sm text-zinc-400 font-medium mt-0.5">
                    {doctor.yearsOfExperience} years experience
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={doctor.availabilityStatus}
                    note={
                      doctor.visibility.showAvailabilityNote
                        ? doctor.availabilityNote
                        : undefined
                    }
                    size="md"
                  />
                  <span className="text-xs font-bold text-brand">{availLabel}</span>
                </div>
              </div>
            </div>

            {/* Registration */}
            <div className="mt-5 flex items-center gap-2.5 px-4 py-3 bg-brand-light rounded-xl border border-brand/10">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" strokeWidth={2.5} />
              <span className="text-sm font-medium text-zinc-700">
                <span className="font-bold text-brand">{doctor.stateMedicalCouncil}</span>
                {" · "}
                Reg. <span className="font-mono text-xs">{doctor.registrationNumber}</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Today highlight */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                When you can visit
              </h2>
              <SchedulePreview doctor={doctor} />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctor.visibility.showPhone && (
                <a
                  href={`tel:${doctor.phone}`}
                  className="flex items-center gap-3 p-4 bg-brand text-white rounded-2xl hover:bg-brand-dark transition-colors group shadow-lg shadow-brand/20"
                >
                  <Phone className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">Call</p>
                    <p className="text-sm font-bold">{doctor.phone}</p>
                  </div>
                </a>
              )}
              {doctor.visibility.showFee && doctor.consultationFee && (
                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <IndianRupee className="w-5 h-5 text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Fee</p>
                    <p className="text-lg font-extrabold text-zinc-900">
                      {formatFee(doctor.consultationFee)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Clinics with photos */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Clinics & seating times
              </h2>
              <p className="text-sm text-zinc-500 mb-4">
                Doctors can add photos of their clinic so you know where to go.
              </p>
              <div className="space-y-5">
                {doctor.practiceLocations.map((loc, i) => (
                  <ClinicScheduleBlock
                    key={i}
                    location={loc}
                    specialization={doctor.specialization}
                    showExactAddress={doctor.visibility.showExactAddress}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Bio */}
            {doctor.visibility.showBio && doctor.bio && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  About
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{doctor.bio}</p>
              </div>
            )}

            {/* Education */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" /> Education
                </h2>
                <ul className="space-y-2">
                  {doctor.qualifications.map((q) => (
                    <li key={q} className="text-sm text-zinc-700 flex items-center gap-2.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {doctor.visibility.showLanguages && doctor.languages && doctor.languages.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5" /> Languages
                </h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="text-xs font-bold px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

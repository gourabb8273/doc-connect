import { HomeHero } from "@/components/patient/HomeHero";
import { DoctorCard } from "@/components/patient/DoctorCard";
import doctorsData from "@/data/doctors.json";
import type { Doctor } from "@/lib/types";
import { Quote } from "lucide-react";

const verifiedDoctors = (doctorsData as Doctor[]).filter((d) => d.status === "verified");
const availableNow = verifiedDoctors.filter((d) => d.availabilityStatus === "available").length;

export default function HomePage() {
  return (
    <div>
      <HomeHero availableNow={availableNow} />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-7">
          <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
            Doctors near you
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            Sorted by distance and availability
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...verifiedDoctors]
            .sort((a, b) => {
              const order = { available: 0, delayed: 1, busy: 2, on_leave: 3 };
              return order[a.availabilityStatus] - order[b.availabilityStatus];
            })
            .map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
        </div>
      </section>

      {/* Vision strip */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-4 items-start">
          <Quote className="w-7 h-7 text-brand/30 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Prescription lost, doctor changed days, clinic moved. You should
              not have to call around or show up blind. Get real time status,
              date, and timings directly from the doctor and save the trip.
              Built from challenges I faced personally — for all patients,
              making it easier to connect and reduce time and stress.
            </p>
            <p className="mt-3 text-xs font-semibold text-zinc-400 tracking-wide">
              — Gourab Banerjee
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

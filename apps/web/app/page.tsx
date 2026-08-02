import { HomeHero } from "@/components/patient/HomeHero";
import { DoctorCard } from "@/components/patient/DoctorCard";
import doctorsData from "@/data/doctors.json";
import type { Doctor } from "@/lib/types";

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
    </div>
  );
}

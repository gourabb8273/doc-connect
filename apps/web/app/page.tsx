import { HomeHero } from "@/components/patient/HomeHero";
import { DoctorCard } from "@/components/patient/DoctorCard";
import { getVerifiedDoctors } from "@/lib/data/doctors";
import { Quote } from "lucide-react";

export default async function HomePage() {
  const verifiedDoctors = await getVerifiedDoctors();
  const availableNow = verifiedDoctors.filter(
    (d) => d.availabilityStatus === "available"
  ).length;

  const sortedDoctors = [...verifiedDoctors].sort((a, b) => {
    const order = { available: 0, delayed: 1, busy: 2, on_leave: 3 };
    return order[a.availabilityStatus] - order[b.availabilityStatus];
  });

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
          {sortedDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      <section className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-4 items-start">
          <Quote className="w-7 h-7 text-brand/30 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              I once needed a doctor near me but had no old prescription to tell
              me who to call. The same doctor sits at different clinics on
              different days. I tried calling, but most numbers only work during
              the appointment window. By the time I figured out the day and time,
              the schedule had already changed. I went anyway and still missed
              them. I built Find Near Doctor so you can see who is near you,
              where they are today, and live status, date, and timings from the
              doctor before you step out.
            </p>
            <p className="mt-3 text-xs font-semibold text-zinc-400 tracking-wide">
              Gourab Banerjee
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

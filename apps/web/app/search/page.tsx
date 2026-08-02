import { Suspense } from "react";
import { SearchForm } from "@/components/patient/SearchForm";
import { DoctorCard } from "@/components/patient/DoctorCard";
import { SearchX } from "lucide-react";
import doctorsData from "@/data/doctors.json";
import type { Doctor } from "@/lib/types";
import {
  filterDoctors,
  sortDoctors,
  formatSearchSummary,
  parseSearchFilters,
} from "@/lib/search";

interface Props {
  searchParams: Promise<{
    q?: string;
    spec?: string;
    day?: string;
    time?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseSearchFilters(params);
  const allDoctors = doctorsData as Doctor[];
  const results = sortDoctors(filterDoctors(allDoctors, filters), filters);
  const summary = formatSearchSummary(filters);
  const hasFilters = Boolean(summary);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-[20px] card-shadow p-5 mb-8">
        <Suspense>
          <SearchForm variant="inline" />
        </Suspense>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            {results.length > 0
              ? `${results.length} doctor${results.length !== 1 ? "s" : ""} found`
              : "No results"}
          </h1>
          {hasFilters && (
            <p className="text-sm text-zinc-500 mt-1 font-medium">{summary}</p>
          )}
          {!hasFilters && (
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Search by pincode, specialization, day, or time
            </p>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <SearchX className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">
            No doctors match these filters
          </h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Try a nearby pincode, a different day, or widen the time slot. All
            doctors in Mogra are verified and updated live.
          </p>
        </div>
      )}
    </div>
  );
}

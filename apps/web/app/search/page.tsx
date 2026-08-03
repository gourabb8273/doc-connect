import { Suspense } from "react";
import Link from "next/link";
import { SearchForm } from "@/components/patient/SearchForm";
import { DoctorCard } from "@/components/patient/DoctorCard";
import { SearchX, Home, RotateCcw } from "lucide-react";
import { getAllDoctors } from "@/lib/data/doctors";
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
  const allDoctors = await getAllDoctors();
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
              Search by doctor name, pincode, specialization, day, or time
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
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
            <SearchX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-bold text-lg text-slate-800 mb-1">
            No doctors found
          </h3>
          <p className="text-sm text-slate-500 max-w-xs mb-7">
            {hasFilters
              ? "Try adjusting your filters. Use a nearby pincode, a different day, or a wider time slot."
              : "No doctors available right now. Try searching by pincode, specialization, or day."}
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            {hasFilters && (
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold shadow hover:bg-brand-dark transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Clear filters
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

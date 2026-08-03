"use client";

import { Plus, Trash2, Upload, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ClinicDraft } from "@/lib/clinic-draft";
import { emptyClinic } from "@/lib/clinic-draft";
import { ScheduleSlotEditor } from "@/components/doctor/ScheduleSlotEditor";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";
import { readFileAsDataUrl } from "@/lib/onboarding-draft";

interface MultiClinicStepProps {
  clinics: ClinicDraft[];
  onChange: (clinics: ClinicDraft[]) => void;
}

function updateClinic(
  clinics: ClinicDraft[],
  id: string,
  patch: Partial<ClinicDraft>
): ClinicDraft[] {
  return clinics.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

function ClinicCard({
  clinic,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
  canRemove,
}: {
  clinic: ClinicDraft;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ClinicDraft>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-zinc-50 border-b border-zinc-100 hover:bg-zinc-100/80 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 truncate">
            {clinic.name.trim() || `Clinic #${index + 1}`}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {clinic.locality ? `${clinic.locality}, ${clinic.pincode}` : "Add name, address & schedule"}
          </p>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
            aria-label="Remove clinic"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* 1. Clinic name */}
          <div>
            <label className="label">Clinic / hospital name *</label>
            <input
              className="input"
              placeholder="e.g. Sen Clinic, Apollo Chamber"
              value={clinic.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>

          {/* 2. Appointment phone */}
          <div>
            <label className="label">Appointment / booking phone</label>
            <input
              className="input"
              placeholder="10-digit number for this clinic"
              inputMode="numeric"
              maxLength={10}
              value={clinic.appointmentPhone}
              onChange={(e) =>
                onChange({ appointmentPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })
              }
            />
            <p className="text-xs text-zinc-400 mt-1">
              Patients call this number to book at this clinic (can differ from your login phone).
            </p>
            <div className="mt-2">
              <VisibilityToggle
                label="Show this number on public profile"
                description="For this clinic only"
                checked={clinic.showAppointmentPhone}
                onChange={(v) => onChange({ showAppointmentPhone: v })}
              />
            </div>
          </div>

          {/* 3. Address */}
          <div className="space-y-3 rounded-xl bg-zinc-50 border border-zinc-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Location</p>
            <div>
              <label className="label">Full address *</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Street, building, landmark"
                value={clinic.address}
                onChange={(e) => onChange({ address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Locality *</label>
                <input
                  className="input"
                  placeholder="e.g. Mogra"
                  value={clinic.locality}
                  onChange={(e) => onChange({ locality: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Pincode *</label>
                <input
                  className="input"
                  placeholder="700091"
                  maxLength={6}
                  value={clinic.pincode}
                  onChange={(e) =>
                    onChange({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label">State *</label>
              <input
                className="input"
                placeholder="West Bengal"
                value={clinic.state}
                onChange={(e) => onChange({ state: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Consultation type *</label>
              <div className="flex gap-2 mt-1">
                {(["In-person", "Online", "Both"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ consultType: t })}
                    className={cn(
                      "flex-1 py-2 text-xs rounded-xl border font-semibold transition-colors",
                      clinic.consultType === t
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-zinc-600 border-zinc-200"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cover photo */}
          <div>
            <label className="label">Clinic photo (optional)</label>
            {clinic.coverPreview ? (
              <div className="relative h-32 rounded-xl overflow-hidden ring-2 ring-brand/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={clinic.coverPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange({ coverPreview: null, coverFile: null })}
                  className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-lg bg-black/50 text-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-xl p-4 cursor-pointer hover:border-brand/40">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-500">Upload clinic photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const dataUrl = await readFileAsDataUrl(file);
                        onChange({
                          coverFile: file,
                          coverPreview: dataUrl,
                        });
                      } catch {
                        onChange({
                          coverFile: file,
                          coverPreview: URL.createObjectURL(file),
                        });
                      }
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* 4. Days & times */}
          <div className="border-t border-zinc-100 pt-4">
            <p className="text-sm font-bold text-zinc-800 mb-1">When do you see patients here?</p>
            <p className="text-xs text-zinc-500 mb-3">
              Pick days and hours for this clinic. Add morning + evening slots if needed.
            </p>
            <ScheduleSlotEditor
              slots={clinic.scheduleSlots}
              onChange={(scheduleSlots) => onChange({ scheduleSlots })}
            />
          </div>

          {/* 5. Booking rules */}
          <div className="border-t border-zinc-100 pt-4 space-y-3">
            <p className="text-sm font-bold text-zinc-800">Appointment rules for this clinic</p>
            <p className="text-xs text-zinc-500">
              e.g. call 1 day before, 5–6 PM only, token system, max patients.
            </p>
            <div>
              <label className="label">Book how many days ahead?</label>
              <select
                className="input"
                value={clinic.advanceBookingDays}
                onChange={(e) => onChange({ advanceBookingDays: e.target.value })}
              >
                <option value="">Same day OK</option>
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
              </select>
            </div>
            <div>
              <label className="label">Best time to call for booking</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <input
                  type="time"
                  className="input"
                  value={clinic.bookingCallWindowStart}
                  onChange={(e) => onChange({ bookingCallWindowStart: e.target.value })}
                />
                <input
                  type="time"
                  className="input"
                  value={clinic.bookingCallWindowEnd}
                  onChange={(e) => onChange({ bookingCallWindowEnd: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Other rules (optional)</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Token at reception, max 30 patients, bring old reports…"
                value={clinic.instructions}
                onChange={(e) => onChange({ instructions: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MultiClinicStep({ clinics, onChange }: MultiClinicStepProps) {
  const [expandedId, setExpandedId] = useState<string>(clinics[0]?.id ?? "");

  function patchClinic(id: string, patch: Partial<ClinicDraft>) {
    onChange(updateClinic(clinics, id, patch));
  }

  function addClinic() {
    const next = emptyClinic();
    onChange([...clinics, next]);
    setExpandedId(next.id);
  }

  function removeClinic(id: string) {
    const next = clinics.filter((c) => c.id !== id);
    onChange(next.length ? next : [emptyClinic()]);
    if (expandedId === id && next[0]) setExpandedId(next[0].id);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-brand-light/40 border border-brand/10 p-3">
        <p className="text-sm font-semibold text-zinc-800">Add each place you practice</p>
        <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
          One card per clinic or hospital. Each gets its own address, phone, days/times, and booking
          rules. Patients will see all approved clinics on your public profile.
        </p>
      </div>

      <div className="space-y-3">
        {clinics.map((clinic, index) => (
          <ClinicCard
            key={clinic.id}
            clinic={clinic}
            index={index}
            expanded={expandedId === clinic.id}
            onToggle={() => setExpandedId(expandedId === clinic.id ? "" : clinic.id)}
            onChange={(patch) => patchClinic(clinic.id, patch)}
            onRemove={() => removeClinic(clinic.id)}
            canRemove={clinics.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addClinic}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-brand/30 rounded-xl text-sm font-bold text-brand hover:bg-brand-light/30 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add another clinic / location
      </button>
    </div>
  );
}

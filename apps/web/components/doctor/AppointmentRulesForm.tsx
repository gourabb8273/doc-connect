"use client";

import type { AppointmentRules } from "@/lib/types";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";

interface AppointmentRulesFormProps {
  rules: AppointmentRules;
  onChange: (rules: AppointmentRules) => void;
}

export function AppointmentRulesForm({ rules, onChange }: AppointmentRulesFormProps) {
  function patch(partial: Partial<AppointmentRules>) {
    onChange({ ...rules, ...partial });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-brand-light/40 border border-brand/10 p-3">
        <p className="text-xs text-zinc-600 leading-relaxed">
          Tell patients <strong>how to book</strong> — call number, when to call, and any rules
          (e.g. &quot;Call 1 day before between 5–6 PM&quot;, token system, max patients).
        </p>
      </div>

      <div>
        <label className="label">Appointment / booking phone</label>
        <input
          className="input"
          placeholder="10-digit number patients should call (can differ from login)"
          inputMode="numeric"
          maxLength={10}
          value={rules.appointmentPhone?.replace(/^\+91/, "") ?? ""}
          onChange={(e) =>
            patch({
              appointmentPhone: e.target.value.replace(/\D/g, "").slice(0, 10) || undefined,
            })
          }
        />
        <p className="text-xs text-zinc-400 mt-1">
          Optional but recommended — many doctors use a clinic landline or assistant number.
        </p>
      </div>

      <VisibilityToggle
        label="Show booking phone on public profile"
        description="Separate from your login phone visibility"
        checked={rules.showAppointmentPhone ?? true}
        onChange={(v) => patch({ showAppointmentPhone: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Book how many days ahead?</label>
          <select
            className="input"
            value={rules.advanceBookingDays ?? ""}
            onChange={(e) =>
              patch({
                advanceBookingDays: e.target.value ? parseInt(e.target.value, 10) : undefined,
              })
            }
          >
            <option value="">Same day OK</option>
            <option value="1">1 day before</option>
            <option value="2">2 days before</option>
            <option value="3">3 days before</option>
            <option value="7">1 week before</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Best time to call for booking</label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <input
            type="time"
            className="input"
            value={rules.bookingCallWindowStart ?? ""}
            onChange={(e) => patch({ bookingCallWindowStart: e.target.value || undefined })}
          />
          <input
            type="time"
            className="input"
            value={rules.bookingCallWindowEnd ?? ""}
            onChange={(e) => patch({ bookingCallWindowEnd: e.target.value || undefined })}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1">e.g. 17:00 to 18:00 — when you accept booking calls</p>
      </div>

      <div>
        <label className="label">Other booking rules</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="e.g. Call clinic between 5–6 PM. Token given for next day. Max 30 patients. Bring previous reports."
          value={rules.instructions ?? ""}
          onChange={(e) => patch({ instructions: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

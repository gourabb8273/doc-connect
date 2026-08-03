"use client";

import { Plus, Trash2 } from "lucide-react";
import type { DayOfWeek, ScheduleSlot } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL_DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_SLOT: ScheduleSlot = {
  days: ["Mon", "Wed", "Fri"],
  startTime: "10:00",
  endTime: "13:00",
};

interface ScheduleSlotEditorProps {
  slots: ScheduleSlot[];
  onChange: (slots: ScheduleSlot[]) => void;
}

export function ScheduleSlotEditor({ slots, onChange }: ScheduleSlotEditorProps) {
  function updateSlot(index: number, patch: Partial<ScheduleSlot>) {
    const next = slots.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function toggleDay(index: number, day: DayOfWeek) {
    const slot = slots[index]!;
    const days = slot.days.includes(day)
      ? slot.days.filter((d) => d !== day)
      : [...slot.days, day];
    updateSlot(index, { days });
  }

  function addSlot() {
    onChange([...slots, { ...DEFAULT_SLOT, days: [] }]);
  }

  function removeSlot(index: number) {
    onChange(slots.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {slots.map((slot, index) => (
        <div
          key={index}
          className="rounded-xl border border-zinc-200 p-4 space-y-3 bg-white"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-800">Clinic hours #{index + 1}</p>
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">Days you see patients *</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => {
                const active = slot.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index, day)}
                    className={cn(
                      "px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-colors",
                      active
                        ? "bg-brand text-white border-brand"
                        : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-brand/30"
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-500">From *</label>
              <input
                type="time"
                className="input mt-1"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, { startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500">To *</label>
              <input
                type="time"
                className="input mt-1"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, { endTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSlot}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:border-brand/40 hover:text-brand transition-colors"
      >
        <Plus className="w-4 h-4" /> Add another time slot
      </button>
    </div>
  );
}

export { DEFAULT_SLOT };

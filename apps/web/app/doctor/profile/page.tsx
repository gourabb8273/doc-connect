"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Camera, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DoctorProfilePage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fee, setFee] = useState("400");
  const [bio, setBio] = useState(
    "Over 16 years of experience in general medicine and preventive healthcare."
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/doctor/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <h1 className="text-xl font-bold text-slate-900 mb-6">Edit profile</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Photo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Photo</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-slate-100">
                <Image
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Profile"
                  width={64}
                  height={64}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow">
                <Camera className="w-3 h-3 text-white" />
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Update photo</p>
              <p className="text-xs text-slate-400">Clear face photo required</p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Consultation fee (₹)
            </label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Identity fields (locked) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Identity (locked)
            </h2>
            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
              Requires re-verification
            </span>
          </div>
          <div className="flex items-start gap-2.5 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Changing your name or registration number will require re-verification
              and your profile will be hidden from patients until approved again.
            </p>
          </div>
          {[
            { label: "Full name", value: "Dr. Ananya Sen" },
            { label: "Registration number", value: "WBMC-2008-14523" },
            { label: "State Medical Council", value: "WBMC" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
              <input
                value={value}
                readOnly
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          ) : (
            "Save changes"
          )}
        </button>
      </form>
    </div>
  );
}

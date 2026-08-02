"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  FileText,
  MapPin,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_VISIBILITY,
  buildRegistrationNumber,
  type VisibilitySettings,
} from "@/lib/visibility";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";

const STEPS = [
  { id: 1, label: "Basic Info", icon: User },
  { id: 2, label: "Documents", icon: FileText },
  { id: 3, label: "Location", icon: MapPin },
  { id: 4, label: "Consent", icon: CheckSquare },
];

const SPECIALIZATIONS = [
  "General Physician",
  "Paediatrician",
  "Gynaecologist",
  "Cardiologist",
  "Dermatologist",
  "Orthopaedic Surgeon",
  "Neurologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Psychiatrist",
  "Dentist",
  "Physiotherapist",
  "Other",
];

const COUNCILS = ["WBMC", "MCI", "Delhi Medical Council", "Maharashtra Medical Council", "Other"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done && "bg-brand text-white",
                  active && "bg-brand text-white ring-4 ring-brand/20",
                  !done && !active && "bg-zinc-100 text-zinc-400"
                )}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold hidden sm:block",
                  active ? "text-brand" : done ? "text-brand/80" : "text-zinc-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 rounded-full transition-colors",
                  current > step.id ? "bg-brand/40" : "bg-zinc-100"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const council = data.council ?? "WBMC";
  const preview =
    data.regYear && data.regSerial
      ? buildRegistrationNumber(council, data.regYear, data.regSerial)
      : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Full name *</label>
        <input
          className="input"
          placeholder="Dr. Firstname Lastname"
          value={data.name ?? ""}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>

      <div>
        <label className="label">State Medical Council *</label>
        <select
          className="input"
          value={data.council ?? ""}
          onChange={(e) => onChange("council", e.target.value)}
        >
          <option value="">Select council</option>
          {COUNCILS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Registration: council · year · number (not just "WB 56016") */}
      <div className="rounded-xl bg-brand-light/50 border border-brand/10 p-4 space-y-3">
        <div className="flex gap-2 items-start">
          <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-600 leading-relaxed">
            Enter your registration <strong>exactly as on your council certificate</strong>.
            Format is <strong>Council · Year · Number</strong> (e.g. WBMC-2010-16234).
            A short number like &quot;56016&quot; alone is not enough for verification.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Registration year *</label>
            <input
              className="input"
              placeholder="2010"
              inputMode="numeric"
              maxLength={4}
              value={data.regYear ?? ""}
              onChange={(e) =>
                onChange("regYear", e.target.value.replace(/\D/g, "").slice(0, 4))
              }
            />
          </div>
          <div>
            <label className="label">Registration number *</label>
            <input
              className="input"
              placeholder="16234"
              inputMode="numeric"
              value={data.regSerial ?? ""}
              onChange={(e) => onChange("regSerial", e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>
        {preview && (
          <p className="text-xs font-semibold text-brand">
            Saved as: <span className="font-mono">{preview}</span>
          </p>
        )}
      </div>

      <div>
        <label className="label">Specialization *</label>
        <select
          className="input"
          value={data.specialization ?? ""}
          onChange={(e) => onChange("specialization", e.target.value)}
        >
          <option value="">Select specialization</option>
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {data.specialization === "Other" && (
        <div>
          <label className="label">Your specialization *</label>
          <input
            className="input"
            placeholder="e.g. Sports Medicine, Diabetologist..."
            value={data.specializationOther ?? ""}
            onChange={(e) => onChange("specializationOther", e.target.value)}
          />
          <p className="text-xs text-zinc-400 mt-1">
            This is what patients will see on your profile.
          </p>
        </div>
      )}

      <div>
        <label className="label">Years of experience</label>
        <input
          type="number"
          min="0"
          max="60"
          className="input"
          placeholder="e.g. 10"
          value={data.experience ?? ""}
          onChange={(e) => onChange("experience", e.target.value)}
        />
      </div>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-5">
      {[
        { label: "Profile photo *", hint: "Clear face photo — mandatory for trust" },
        { label: "Registration certificate *", hint: "PDF or image of your council registration" },
        { label: "Degree certificate", hint: "MBBS/MD or equivalent" },
        { label: "Govt. ID (Aadhaar / PAN)", hint: "Optional — helps verification" },
      ].map(({ label, hint }) => (
        <div key={label}>
          <label className="label">{label}</label>
          <p className="text-xs text-zinc-400 mb-2">{hint}</p>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-xl p-5 cursor-pointer hover:border-brand/40 hover:bg-brand-light/30 transition-colors">
            <Upload className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-500">Click to upload or take photo</span>
            <input type="file" accept="image/*,application/pdf" className="hidden" />
          </label>
        </div>
      ))}
    </div>
  );
}

function Step3({
  data,
  onChange,
  clinicCoverPreview,
  onClinicCoverChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
  clinicCoverPreview: string | null;
  onClinicCoverChange: (file: File | null, preview: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Clinic cover photo */}
      <div className="rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-800">Clinic cover photo</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Optional — helps patients recognise your clinic on search and your profile.
            If skipped, a themed placeholder is used based on your specialization.
          </p>
        </div>
        <div className="p-4">
          {clinicCoverPreview ? (
            <div className="relative h-36 rounded-xl overflow-hidden mb-3 ring-2 ring-brand/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={clinicCoverPreview}
                alt="Clinic cover preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onClinicCoverChange(null, null)}
                className="absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-lg bg-black/50 text-white hover:bg-black/70"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-xl p-6 cursor-pointer hover:border-brand/40 hover:bg-brand-light/20 transition-colors mb-1">
              <Upload className="w-5 h-5 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600">
                Upload clinic or hospital photo
              </span>
              <span className="text-xs text-zinc-400">Front view, waiting area, or signboard</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onClinicCoverChange(file, URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="label">Clinic / Hospital name *</label>
        <input
          className="input"
          placeholder="e.g. Sen Clinic"
          value={data.clinicName ?? ""}
          onChange={(e) => onChange("clinicName", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Full address *</label>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Street address"
          value={data.address ?? ""}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Locality *</label>
          <input
            className="input"
            placeholder="e.g. Mogra"
            value={data.locality ?? ""}
            onChange={(e) => onChange("locality", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Pincode *</label>
          <input
            className="input"
            placeholder="700091"
            maxLength={6}
            value={data.pincode ?? ""}
            onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </div>
      <div>
        <label className="label">State *</label>
        <input
          className="input"
          placeholder="West Bengal"
          value={data.state ?? ""}
          onChange={(e) => onChange("state", e.target.value)}
        />
      </div>
      <div>
        <label className="label">Consultation type *</label>
        <div className="flex gap-2">
          {["In-person", "Online", "Both"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange("consultType", t)}
              className={cn(
                "flex-1 py-2.5 text-sm rounded-xl border font-semibold transition-colors",
                data.consultType === t
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-brand/30"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4({
  consents,
  setConsents,
  visibility,
  setVisibility,
  fee,
  setFee,
  bio,
  setBio,
}: {
  consents: boolean[];
  setConsents: (c: boolean[]) => void;
  visibility: VisibilitySettings;
  setVisibility: (v: VisibilitySettings) => void;
  fee: string;
  setFee: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
}) {
  const consentItems = [
    "I confirm the information I have provided is true and I am a registered medical practitioner.",
    "I understand my profile will be reviewed manually before it appears in public search.",
    "I agree to FindMyDoc's terms and consent to display only the profile details I choose to show.",
  ];

  function handleFeeChange(raw: string) {
    if (raw === "") {
      setFee("");
      return;
    }
    const num = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(num)) return;
    setFee(String(Math.max(0, Math.min(num, 99999))));
  }

  return (
    <div className="space-y-5">
      {/* Visibility — doctor chooses what patients see */}
      <div className="rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            What patients can see
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            You control this. Hidden fields won&apos;t appear on your public profile.
          </p>
        </div>
        <div className="px-4">
          <VisibilityToggle
            label="Phone number"
            description="Let patients call you directly"
            checked={visibility.showPhone}
            onChange={(v) => setVisibility({ ...visibility, showPhone: v })}
          />
          <VisibilityToggle
            label="Consultation fee"
            description="Show your fee on your profile"
            checked={visibility.showFee}
            onChange={(v) => setVisibility({ ...visibility, showFee: v })}
          />
          <VisibilityToggle
            label="Exact address"
            description="Off = only locality shown (e.g. Mogra)"
            checked={visibility.showExactAddress}
            onChange={(v) => setVisibility({ ...visibility, showExactAddress: v })}
          />
          <VisibilityToggle
            label="Running late note"
            description="Show a message when you mark yourself as delayed"
            checked={visibility.showAvailabilityNote}
            onChange={(v) => setVisibility({ ...visibility, showAvailabilityNote: v })}
          />
        </div>
      </div>

      {/* Optional details */}
      <div>
        <label className="label">Consultation fee (optional)</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
            ₹
          </span>
          <input
            className="input pl-8"
            placeholder="e.g. 500"
            inputMode="numeric"
            min={0}
            value={fee}
            onChange={(e) => handleFeeChange(e.target.value)}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          {visibility.showFee
            ? "Fee will be visible to patients once approved."
            : "Fee is saved but hidden until you turn it on above or in your dashboard."}
        </p>
      </div>

      <div>
        <label className="label">Short bio (optional)</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Tell patients about your practice..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Consent */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          Before you submit
        </p>
        {consentItems.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consents[i] ?? false}
              onChange={(e) => {
                const next = [...consents];
                next[i] = e.target.checked;
                setConsents(next);
              }}
              className="mt-0.5 accent-brand w-4 h-4 shrink-0 rounded"
            />
            <span className="text-sm text-zinc-600 leading-relaxed group-hover:text-zinc-900">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({ council: "WBMC" });
  const [consents, setConsents] = useState<boolean[]>([false, false, false]);
  const [visibility, setVisibility] = useState<VisibilitySettings>(DEFAULT_VISIBILITY);
  const [fee, setFee] = useState("");
  const [bio, setBio] = useState("");
  const [clinicCoverPreview, setClinicCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleClinicCoverChange(_file: File | null, preview: string | null) {
    setClinicCoverPreview(preview);
  }

  function updateField(k: string, v: string) {
    setFormData((prev) => ({ ...prev, [k]: v }));
  }

  function nextStep() {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  }

  function handleSubmit() {
    setSubmitting(true);
    // In real app: POST with visibility, fee, bio, buildRegistrationNumber(...)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  }

  const specValid =
    formData.specialization &&
    (formData.specialization !== "Other" || (formData.specializationOther?.trim().length ?? 0) > 1);

  const regValid =
    formData.council &&
    formData.regYear?.length === 4 &&
    (formData.regSerial?.length ?? 0) >= 3;

  const allConsents = consents.every(Boolean);

  const canNext =
    step === 1
      ? !!(formData.name && regValid && specValid)
      : step === 2
      ? true
      : step === 3
      ? !!(
          formData.clinicName &&
          formData.address &&
          formData.locality &&
          formData.pincode &&
          formData.state &&
          formData.consultType
        )
      : allConsents;

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 mb-2">Submitted!</h2>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            Your profile is under review. We&apos;ll verify your WBMC registration and
            notify you via SMS once approved.
          </p>
          <button
            onClick={() => router.push("/doctor/dashboard")}
            className="w-full py-3.5 bg-brand text-white font-bold text-sm rounded-xl hover:bg-brand-dark transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-xl font-extrabold text-zinc-900 mb-1">Register your practice</h1>
      <p className="text-sm text-zinc-500 mb-6 font-medium">
        Step {step} of {STEPS.length} · {STEPS[step - 1]!.label}
      </p>

      <StepIndicator current={step} />

      <style>{`
        .label { display:block; font-size:0.8125rem; font-weight:600; color:#3f3f46; margin-bottom:0.375rem; }
        .input { width:100%; padding:0.75rem 1rem; font-size:0.875rem; font-weight:500; color:#18181b; border-radius:0.75rem; border:1px solid #e4e4e7; outline:none; background:white; transition:box-shadow 0.15s; }
        .input:focus { box-shadow:0 0 0 2px rgba(37,99,235,0.25); border-color:transparent; }
      `}</style>

      <div className="bg-white rounded-[20px] card-shadow p-6 mb-6">
        {step === 1 && <Step1 data={formData} onChange={updateField} />}
        {step === 2 && <Step2 />}
        {step === 3 && (
          <Step3
            data={formData}
            onChange={updateField}
            clinicCoverPreview={clinicCoverPreview}
            onClinicCoverChange={handleClinicCoverChange}
          />
        )}
        {step === 4 && (
          <Step4
            consents={consents}
            setConsents={setConsents}
            visibility={visibility}
            setVisibility={setVisibility}
            fee={fee}
            setFee={setFee}
            bio={bio}
            setBio={setBio}
          />
        )}
      </div>

      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-5 py-3 border border-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl hover:bg-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button
          onClick={nextStep}
          disabled={!canNext || submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : step === 4 ? (
            <>
              Submit for verification <CheckCircle2 className="w-4 h-4" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

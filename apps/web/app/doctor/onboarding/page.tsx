"use client";

import { useState, useEffect } from "react";
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
  AlertTriangle,
} from "lucide-react";
import {
  DOCTOR_TITLE_OPTIONS,
  formatDoctorDisplayName,
  normalizeBareName,
  type DoctorTitle,
} from "@/lib/doctor-name";
import {
  DEFAULT_VISIBILITY,
  buildRegistrationNumber,
  resolveSpecialization,
  type VisibilitySettings,
} from "@/lib/visibility";
import { VisibilityToggle } from "@/components/ui/VisibilityToggle";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MultiClinicStep } from "@/components/doctor/MultiClinicStep";
import {
  clinicDraftToAppointmentRules,
  isClinicDraftValid,
  draftFromPracticeLocation,
  type ClinicDraft,
} from "@/lib/clinic-draft";
import { apiGet, apiPost, mapConsultType, uploadFile } from "@/lib/api/client";
import type { DocumentType } from "@/lib/types";
import { useOnboardingDraft } from "@/hooks/useOnboardingDraft";
import {
  fileToStoredDraft,
  storedDraftToFile,
  dataUrlToFile,
  loadOnboardingDraft,
  type DocField,
} from "@/lib/onboarding-draft";

function clx(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

type DocFieldLocal = DocField;

const DOC_FIELDS: {
  key: DocFieldLocal;
  label: string;
  hint: string;
  required: boolean;
}[] = [
  { key: "photo", label: "Profile photo *", hint: "Clear face photo, mandatory for trust", required: true },
  { key: "registration_cert", label: "Registration certificate *", hint: "PDF or image of council registration", required: true },
  { key: "degree", label: "Degree certificate", hint: "MBBS/MD or equivalent", required: false },
  { key: "govt_id", label: "Govt. ID (Aadhaar / PAN)", hint: "Optional, helps verification", required: false },
];

const STEPS = [
  { id: 1, label: "Basic Info", icon: User },
  { id: 2, label: "Documents", icon: FileText },
  { id: 3, label: "Clinics", icon: MapPin },
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
                className={clx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done && "bg-brand text-white",
                  active && "bg-brand text-white ring-4 ring-brand/20",
                  !done && !active && "bg-zinc-100 text-zinc-400"
                )}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </div>
              <span
                className={clx(
                  "text-[10px] font-semibold hidden sm:block",
                  active ? "text-brand" : done ? "text-brand/80" : "text-zinc-400"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={clx(
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
  const title = (data.title as DoctorTitle) || "dr";
  const bareName = normalizeBareName(data.name ?? "");
  const namePreview = bareName ? formatDoctorDisplayName(title, bareName) : "";
  const preview =
    data.regYear && data.regSerial
      ? buildRegistrationNumber(council, data.regYear, data.regSerial)
      : null;

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Title *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DOCTOR_TITLE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange("title", value)}
              className={clx(
                "py-2.5 text-sm rounded-xl border font-semibold transition-colors",
                title === value
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-brand/30"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Your name *</label>
        <input
          className="input"
          placeholder="Ratul Roy"
          value={data.name ?? ""}
          onChange={(e) => onChange("name", e.target.value)}
        />
        <p className="text-xs text-zinc-400 mt-1">Enter name without title — we add Dr./Prof. from your choice above.</p>
        {namePreview && (
          <p className="text-xs font-semibold text-brand mt-2">
            Shown to patients as: <span className="font-mono">{namePreview}</span>
          </p>
        )}
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

function Step2({
  docFiles,
  onDocChange,
}: {
  docFiles: Partial<Record<DocFieldLocal, { name: string }>>;
  onDocChange: (key: DocFieldLocal, file: File | null) => void;
}) {
  return (
    <div className="space-y-5">
      {DOC_FIELDS.map(({ key, label, hint, required }) => {
        const file = docFiles[key];
        return (
          <div key={key}>
            <label className="label">{label}</label>
            <p className="text-xs text-zinc-400 mb-2">{hint}</p>
            {file ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-brand/20 bg-brand-light/30">
                <span className="text-sm text-zinc-700 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onDocChange(key, null)}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 shrink-0 ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 rounded-xl p-5 cursor-pointer hover:border-brand/40 hover:bg-brand-light/30 transition-colors">
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-zinc-500">
                  {required ? "Click to upload (required)" : "Click to upload"}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onDocChange(key, f);
                  }}
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step4Consent({
  consents,
  setConsents,
  visibility,
  setVisibility,
  fee,
  setFee,
  bio,
  setBio,
  clinics,
  setClinics,
}: {
  consents: boolean[];
  setConsents: (c: boolean[]) => void;
  visibility: VisibilitySettings;
  setVisibility: (v: VisibilitySettings) => void;
  fee: string;
  setFee: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  clinics: import("@/lib/clinic-draft").ClinicDraft[];
  setClinics: (c: import("@/lib/clinic-draft").ClinicDraft[]) => void;
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
            label="Your login phone number"
            description="Let patients call you directly on your registered number"
            checked={visibility.showPhone}
            onChange={(v) => setVisibility({ ...visibility, showPhone: v })}
          />

          {/* Per-clinic appointment phone toggles */}
          {clinics.map((clinic, i) => {
            const label = clinic.name.trim() || `Clinic #${i + 1}`;
            const phone = clinic.appointmentPhone;
            return (
              <VisibilityToggle
                key={clinic.id}
                label={`Appointment phone — ${label}`}
                description={
                  phone
                    ? `+91 ${phone} · patients call to book`
                    : "No appointment number set for this clinic"
                }
                checked={clinic.showAppointmentPhone}
                onChange={(v) =>
                  setClinics(
                    clinics.map((c) =>
                      c.id === clinic.id ? { ...c, showAppointmentPhone: v } : c
                    )
                  )
                }
              />
            );
          })}

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
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium select-none pointer-events-none">
            ₹
          </span>
          <input
            className="input pl-9"
            placeholder="500"
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
  const {
    step,
    formData,
    consents,
    visibility,
    clinics,
    fee,
    bio,
    docFiles,
    hydrated,
    draftRestored,
    draftSaveWarning,
    setStep,
    setConsents,
    setVisibility,
    setClinics,
    setFee,
    setBio,
    setDocFiles,
    updateField,
    clearDraft,
    clearDraftAfterSubmit,
  } = useOnboardingDraft();

  const [resubmitNote, setResubmitNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    apiGet<{
      doctor: {
        status?: string;
        rejectionReason?: string;
        practiceLocations?: Parameters<typeof draftFromPracticeLocation>[0][];
      } | null;
    }>("/api/doctors/me")
      .then((res) => {
        if (res.doctor?.status === "rejected" && res.doctor.rejectionReason) {
          setResubmitNote(res.doctor.rejectionReason);
        }
        const draft = loadOnboardingDraft();
        const draftHasClinic = draft?.clinics?.some((c) => c.name.trim());
        if (!draftHasClinic && res.doctor?.practiceLocations?.length) {
          setClinics(res.doctor.practiceLocations.map((loc) => draftFromPracticeLocation(loc)));
        }
      })
      .catch(() => {});
  }, [hydrated, setClinics]);

  async function handleDocChange(key: DocFieldLocal, file: File | null) {
    if (!file) {
      const next = { ...docFiles };
      delete next[key];
      setDocFiles(next);
      return;
    }
    try {
      const stored = await fileToStoredDraft(file);
      setDocFiles({ ...docFiles, [key]: stored });
    } catch {
      setSubmitError("Could not save document locally — try a smaller file");
    }
  }

  function nextStep() {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const council = formData.council ?? "WBMC";
      const registrationNumber = buildRegistrationNumber(
        council,
        formData.regYear!,
        formData.regSerial!
      );
      const specialization = resolveSpecialization(
        formData.specialization!,
        formData.specializationOther
      );

      const documents: { type: DocumentType; url: string; fileName?: string; mimeType?: string }[] = [];

      for (const { key } of DOC_FIELDS) {
        const stored = docFiles[key];
        if (!stored?.dataUrl) continue;
        const file = await storedDraftToFile(stored);
        const uploaded = await uploadFile(file);
        documents.push({
          type: key,
          url: uploaded.url,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
        });
      }

      const practiceLocations: {
        name: string;
        address: string;
        locality: string;
        pincode: string;
        state: string;
        consultationType: ReturnType<typeof mapConsultType>;
        imageUrl?: string;
        schedule: ClinicDraft["scheduleSlots"];
        appointmentRules: ReturnType<typeof clinicDraftToAppointmentRules>;
      }[] = [];

      for (const clinic of clinics) {
        let imageUrl: string | undefined = clinic.coverPreview?.startsWith("http")
          ? clinic.coverPreview
          : undefined;

        if (clinic.coverFile) {
          const uploaded = await uploadFile(clinic.coverFile);
          imageUrl = uploaded.url;
          documents.push({
            type: "clinic_cover",
            url: uploaded.url,
            fileName: uploaded.fileName,
            mimeType: uploaded.mimeType,
          });
        } else if (clinic.coverPreview?.startsWith("data:")) {
          const file = await dataUrlToFile(
            clinic.coverPreview,
            `clinic-${clinic.id}.jpg`,
            "image/jpeg"
          );
          if (file) {
            const uploaded = await uploadFile(file);
            imageUrl = uploaded.url;
            documents.push({
              type: "clinic_cover",
              url: uploaded.url,
              fileName: uploaded.fileName,
              mimeType: uploaded.mimeType,
            });
          }
        } else if (clinic.coverPreview?.startsWith("http")) {
          imageUrl = clinic.coverPreview;
        }

        practiceLocations.push({
          name: clinic.name,
          address: clinic.address,
          locality: clinic.locality,
          pincode: clinic.pincode,
          state: clinic.state,
          consultationType: mapConsultType(clinic.consultType),
          imageUrl,
          schedule: clinic.scheduleSlots,
          appointmentRules: clinicDraftToAppointmentRules(clinic),
        });
      }

      await apiPost("/api/doctors/apply", {
        name: normalizeBareName(formData.name),
        title: (formData.title as DoctorTitle) || "dr",
        registrationNumber,
        stateMedicalCouncil: council,
        specialization,
        yearsOfExperience: formData.experience ? parseInt(formData.experience, 10) : 0,
        consultationFee: fee ? parseInt(fee, 10) : undefined,
        bio: bio || undefined,
        registrationMeta: {
          council,
          regYear: formData.regYear!,
          regSerial: formData.regSerial!,
        },
        visibility: {
          showPhone: visibility.showPhone,
          showFee: visibility.showFee,
          showExactAddress: visibility.showExactAddress,
          showBio: true,
          showLanguages: false,
          showAvailabilityNote: visibility.showAvailabilityNote,
        },
        practiceLocations,
        documents,
        consents: {
          termsAccepted: true,
          dataSharingAccepted: true,
          verificationAccepted: true,
        },
      });

      clearDraftAfterSubmit();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const specValid =
    formData.specialization &&
    (formData.specialization !== "Other" || (formData.specializationOther?.trim().length ?? 0) > 1);

  const regValid =
    formData.council &&
    formData.regYear?.length === 4 &&
    (formData.regSerial?.length ?? 0) >= 3;

  const allConsents = consents.every(Boolean);

  const clinicsValid = clinics.length > 0 && clinics.every(isClinicDraftValid);

  const canNext =
    step === 1
      ? !!(normalizeBareName(formData.name).length >= 2 && regValid && specValid)
      : step === 2
      ? !!(docFiles.photo?.dataUrl && docFiles.registration_cert?.dataUrl)
      : step === 3
      ? clinicsValid
      : allConsents;

  if (!hydrated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading your registration…
      </div>
    );
  }

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

      {draftRestored && (
        <div className="flex items-start justify-between gap-3 p-3 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs text-emerald-800 leading-relaxed">
            <strong>Saved locally.</strong> Your progress from step {step} was restored after refresh.
          </p>
          <button
            type="button"
            onClick={clearDraft}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 shrink-0"
          >
            Start over
          </button>
        </div>
      )}

      {draftSaveWarning && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Some uploaded files are too large to save in the browser. Re-upload documents if they
          disappear after refresh.
        </p>
      )}

      {resubmitNote && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Admin asked for changes</p>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">{resubmitNote}</p>
            <p className="text-xs text-amber-700 mt-2">Update your details below and submit again.</p>
          </div>
        </div>
      )}

      <style>{`
        .label { display:block; font-size:0.8125rem; font-weight:600; color:#3f3f46; margin-bottom:0.375rem; }
        .input { width:100%; padding:0.75rem 1rem; font-size:0.875rem; font-weight:500; color:#18181b; border-radius:0.75rem; border:1px solid #e4e4e7; outline:none; background:white; transition:box-shadow 0.15s; }
        .input:focus { box-shadow:0 0 0 2px rgba(37,99,235,0.25); border-color:transparent; }
      `}</style>

      <div className="bg-white rounded-[20px] card-shadow p-6 mb-6">
        {step === 1 && <Step1 data={formData} onChange={updateField} />}
        {step === 2 && <Step2 docFiles={docFiles} onDocChange={handleDocChange} />}
        {step === 3 && <MultiClinicStep clinics={clinics} onChange={setClinics} />}
        {step === 4 && (
          <Step4Consent
            consents={consents}
            setConsents={setConsents}
            visibility={visibility}
            setVisibility={setVisibility}
            fee={fee}
            setFee={setFee}
            bio={bio}
            setBio={setBio}
            clinics={clinics}
            setClinics={setClinics}
          />
        )}
      </div>

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">{submitError}</p>
      )}

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

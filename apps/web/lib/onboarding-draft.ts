import type { VisibilitySettings } from "@/lib/visibility";
import { DEFAULT_VISIBILITY } from "@/lib/visibility";
import type { ClinicDraft } from "@/lib/clinic-draft";
import { emptyClinic } from "@/lib/clinic-draft";

const STORAGE_KEY = "find-near-doctor-onboarding-draft";
const MAX_BYTES = 4 * 1024 * 1024;

export type DocField = "photo" | "registration_cert" | "degree" | "govt_id";

export interface StoredFileDraft {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface OnboardingDraft {
  version: 1;
  savedAt: string;
  step: number;
  formData: Record<string, string>;
  consents: boolean[];
  visibility: VisibilitySettings;
  clinics: ClinicDraft[];
  fee: string;
  bio: string;
  docFiles: Partial<Record<DocField, StoredFileDraft>>;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export async function storedDraftToFile(stored: StoredFileDraft): Promise<File> {
  const res = await fetch(stored.dataUrl);
  const blob = await res.blob();
  return new File([blob], stored.name, { type: stored.mimeType });
}

export async function fileToStoredDraft(file: File): Promise<StoredFileDraft> {
  return {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    dataUrl: await readFileAsDataUrl(file),
  };
}

function draftByteSize(draft: OnboardingDraft): number {
  return new Blob([JSON.stringify(draft)]).size;
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (parsed.version !== 1) return null;
    return {
      ...parsed,
      clinics: parsed.clinics?.length ? parsed.clinics.map(sanitizeClinic) : [emptyClinic()],
      docFiles: parsed.docFiles ?? {},
      visibility: parsed.visibility ?? DEFAULT_VISIBILITY,
      consents: parsed.consents ?? [false, false, false],
    };
  } catch {
    return null;
  }
}

function sanitizeClinic(c: ClinicDraft): ClinicDraft {
  return {
    ...c,
    coverFile: null,
    scheduleSlots: c.scheduleSlots?.length ? c.scheduleSlots : emptyClinic().scheduleSlots,
  };
}

export function saveOnboardingDraft(draft: Omit<OnboardingDraft, "version" | "savedAt">): boolean {
  if (typeof window === "undefined") return false;
  try {
    const payload: OnboardingDraft = {
      version: 1,
      savedAt: new Date().toISOString(),
      ...draft,
      clinics: draft.clinics.map((c) => ({ ...c, coverFile: null })),
    };
    if (draftByteSize(payload) > MAX_BYTES) {
      const lean: OnboardingDraft = {
        ...payload,
        docFiles: Object.fromEntries(
          Object.entries(payload.docFiles).map(([k, v]) => [
            k,
            v ? { name: v.name, mimeType: v.mimeType, dataUrl: "" } : v,
          ])
        ) as OnboardingDraft["docFiles"],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lean));
      return false;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasOnboardingDraft(): boolean {
  return loadOnboardingDraft() !== null;
}

/** Convert data-URL clinic cover to File for upload after refresh. */
export async function dataUrlToFile(
  dataUrl: string,
  fileName: string,
  mimeType: string
): Promise<File | null> {
  if (!dataUrl.startsWith("data:")) return null;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: mimeType });
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { VisibilitySettings } from "@/lib/visibility";
import { DEFAULT_VISIBILITY } from "@/lib/visibility";
import type { ClinicDraft } from "@/lib/clinic-draft";
import { emptyClinic } from "@/lib/clinic-draft";
import {
  loadOnboardingDraft,
  saveOnboardingDraft,
  clearOnboardingDraft,
  type StoredFileDraft,
  type DocField,
} from "@/lib/onboarding-draft";

export interface OnboardingFormState {
  step: number;
  formData: Record<string, string>;
  consents: boolean[];
  visibility: VisibilitySettings;
  clinics: ClinicDraft[];
  fee: string;
  bio: string;
  docFiles: Partial<Record<DocField, StoredFileDraft>>;
}

const DEFAULTS: OnboardingFormState = {
  step: 1,
  formData: { council: "WBMC", title: "dr" },
  consents: [false, false, false],
  visibility: DEFAULT_VISIBILITY,
  clinics: [emptyClinic()],
  fee: "",
  bio: "",
  docFiles: {},
};

export function useOnboardingDraft() {
  const [state, setState] = useState<OnboardingFormState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaveWarning, setDraftSaveWarning] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    const draft = loadOnboardingDraft();
    if (draft) {
      setState({
        step: draft.step,
        formData: draft.formData,
        consents: draft.consents,
        visibility: draft.visibility,
        clinics: draft.clinics,
        fee: draft.fee,
        bio: draft.bio,
        docFiles: draft.docFiles,
      });
      setDraftRestored(true);
    }
    setHydrated(true);
    skipSave.current = false;
  }, []);

  useEffect(() => {
    if (!hydrated || skipSave.current) return;
    const ok = saveOnboardingDraft(state);
    setDraftSaveWarning(!ok);
  }, [state, hydrated]);

  function patch(partial: Partial<OnboardingFormState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function clearDraft() {
    clearOnboardingDraft();
    setState(DEFAULTS);
    setDraftRestored(false);
    setDraftSaveWarning(false);
  }

  function clearDraftAfterSubmit() {
    clearOnboardingDraft();
  }

  return {
    ...state,
    hydrated,
    draftRestored,
    draftSaveWarning,
    setStep: (step: number) => patch({ step }),
    setFormData: (formData: Record<string, string>) => patch({ formData }),
    updateField: (k: string, v: string) =>
      setState((prev) => ({ ...prev, formData: { ...prev.formData, [k]: v } })),
    setConsents: (consents: boolean[]) => patch({ consents }),
    setVisibility: (visibility: VisibilitySettings) => patch({ visibility }),
    setClinics: (clinics: ClinicDraft[]) => patch({ clinics }),
    setFee: (fee: string) => patch({ fee }),
    setBio: (bio: string) => patch({ bio }),
    setDocFiles: (docFiles: Partial<Record<DocField, StoredFileDraft>>) => patch({ docFiles }),
    clearDraft,
    clearDraftAfterSubmit,
  };
}

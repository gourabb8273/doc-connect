# Doctor onboarding — data model

How the 4-step doctor registration flow maps to MongoDB and Cloudinary.

---

## Flow overview

```
Step 1 Basic Info ──► Step 2 Documents ──► Step 3 Location ──► Step 4 Consent
       │                    │                      │                    │
       └────────────────────┴──────────────────────┴────────────────────┘
                                        │
                                        ▼
                         POST /api/doctors/apply
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
        doctors collection    verification_audit          Cloudinary
        (full profile)        action: "submitted"         (file URLs)
```

All steps are preserved in a single `doctors` document plus an audit row on submit.

---

## Step → field mapping

### Step 1 — Basic Info

| Form field | Stored in `doctors` | Notes |
|------------|---------------------|-------|
| Full name | `name` | |
| Medical council | `stateMedicalCouncil` | e.g. WBMC |
| Registration year | `registrationMeta.regYear` | Preserved separately |
| Registration serial | `registrationMeta.regSerial` | Preserved separately |
| Composed number | `registrationNumber` | e.g. `WBMC-2010-16234` |
| Specialization | `specialization` | |
| Years of experience | `yearsOfExperience` | |
| Phone | `phone` | From OTP session, not form |

Also copied into `onboardingProgress.step1` at submit time.

### Step 2 — Documents

| Upload | Cloudinary folder | `documents[]` type |
|--------|-------------------|-------------------|
| Profile photo * | `find-near-doctor/dev/doctors/{phone}/` | `photo` |
| Registration cert * | same | `registration_cert` |
| Degree | same | `degree` |
| Govt ID | same | `govt_id` |

- Files uploaded via `POST /api/upload` (auth required)
- Folder is auto-set from doctor phone: `find-near-doctor/dev/doctors/9198XXXXXXXX/`
- MongoDB stores `{ type, url, fileName, mimeType, uploadedAt }` only

Also recorded in `onboardingProgress.step2.uploadedTypes`.

### Step 3 — Location

| Form field | Stored in `doctors` | Notes |
|------------|---------------------|-------|
| Clinic name | `practiceLocations[0].name` | |
| Full address | `practiceLocations[0].address` | |
| Locality | `practiceLocations[0].locality` | |
| Pincode | `practiceLocations[0].pincode` | |
| State | `practiceLocations[0].state` | |
| Consultation type | `practiceLocations[0].consultationType` | in_person / online / both |
| Clinic cover photo | `practiceLocations[0].imageUrl` + `documents[]` type `clinic_cover` | Optional |

Also copied into `onboardingProgress.step3`.

### Step 4 — Consent & visibility

| Form field | Stored in `doctors` | Notes |
|------------|---------------------|-------|
| Visibility toggles | `visibility{}` | showPhone, showFee, showExactAddress, etc. |
| Consultation fee | `consultationFee` | Optional |
| Bio | `bio` | Optional |
| Consent checkboxes | `consents{}` | terms, data sharing, verification + `acceptedAt` |

Also copied into `onboardingProgress.step4`.

---

## Collections touched on registration

### `doctors` (primary)

Created or updated on submit with:

```typescript
{
  id, phone, name, photoUrl, registrationNumber, stateMedicalCouncil,
  specialization, yearsOfExperience, status: "pending",
  practiceLocations[], visibility{}, consultationFee?, bio?,
  documents[],                    // all uploaded file URLs
  registrationMeta: { council, regYear, regSerial },
  onboardingProgress: {           // snapshot of all 4 steps
    completedSteps: [1,2,3,4],
    step1, step2, step3, step4,
    submittedAt
  },
  submittedAt,
  consents,
  verificationHistory: [{ action: "submitted", at }],
  createdAt, updatedAt
}
```

**Indexes:** `id`, `phone`, `status`, `registrationNumber + stateMedicalCouncil`

### `verification_audit`

New row on every submit:

```typescript
{
  id, doctorId,
  action: "submitted",
  registrationNumber,
  note: "Initial onboarding submission" | "Application resubmitted after rejection",
  createdAt
}
```

Admin approve/reject adds separate rows with `action: "approved" | "rejected"`.

### `otps`

Used before onboarding (login). TTL 10 minutes — not part of profile storage.

### `admins`

Not touched during doctor registration.

---

## Resubmission after rejection

If admin rejects (`status: "rejected"`), doctor can log in again and resubmit:

- Same `id` and `phone` kept
- `documents[]` replaced with new uploads
- `verificationHistory` gets `{ action: "resubmitted", at }`
- New `verification_audit` row with `action: "submitted"`
- `onboardingProgress` and `submittedAt` updated

---

## What is NOT stored in MongoDB

- Binary file content (photos, PDFs) → **Cloudinary**
- OTP plaintext → only bcrypt hash in `otps` (deleted after verify or TTL)

---

## Related docs

- [database-schema.md](./database-schema.md) — full collection schemas
- [api-database-plan.md](./api-database-plan.md) — API reference
- [services-setup.md](./services-setup.md) — Cloudinary & MSG91 setup

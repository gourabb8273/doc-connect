# Database schema (dev: `find-near-doctor-dev`)

MongoDB stores **metadata and URLs only**. Files (photos, PDFs) go to **Cloudinary** (free tier for dev).

## Collections overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   admins    │     │      otps        │     │ verification_audit  │
│ username    │     │ phone (TTL 10m)  │     │ doctorId, action    │
│ passwordHash│     │ codeHash         │     │ adminId, screenshot │
└─────────────┘     └──────────────────┘     └─────────────────────┘
                                                        │
┌─────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────────┐
│                          doctors                                 │
│  id, phone, name, registrationNumber, status, availability...   │
│  practiceLocations[], visibility{}, documents[]{url,type}         │
│  verificationHistory[]{action, by, note, at}                    │
└─────────────────────────────────────────────────────────────────┘
```

| Collection | Purpose | TTL |
|------------|---------|-----|
| `doctors` | Doctor profiles, documents URLs, status, locations | — |
| `admins` | Admin login (username + password hash) | — |
| `otps` | Doctor phone OTP codes | 10 min auto-delete |
| `verification_audit` | Submit, approve, reject audit trail | — |
| `analytics_events` | Public page views, search, profile views | 90 days (TTL) |
| `analytics_daily` | Daily rollups (future cron) | — |

## `doctors`

```typescript
{
  id: string,                    // e.g. dr-abc123 (unique)
  phone: string,                 // E.164, unique when verified
  name: string,
  photoUrl: string,
  registrationNumber: string,    // composed e.g. WBMC-2010-16234
  registrationMeta?: {           // Step 1 raw fields preserved
    council: string,
    regYear: string,
    regSerial: string
  },
  stateMedicalCouncil: string,   // WBMC
  specialization: string,
  yearsOfExperience?: number,
  status: "pending" | "verified" | "rejected" | "suspended",
  availabilityStatus: "available" | "busy" | "delayed" | "on_leave",
  availabilityNote?: string,
  practiceLocations: PracticeLocation[],
  visibility: DoctorVisibility,
  consultationFee?: number,
  bio?: string,
  languages?: string[],
  qualifications?: string[],
  documents: [{
    type: "photo" | "registration_cert" | "degree" | "govt_id" | "selfie" | "clinic_cover",
    url: string,
    fileName?: string,
    mimeType?: string,
    uploadedAt: string
  }],
  onboardingProgress?: {         // Snapshot of all 4 steps at submit
    completedSteps: number[],
    step1?, step2?, step3?, step4?,
    submittedAt: string
  },
  verificationHistory: [{
    action: "submitted" | "approved" | "rejected" | "resubmitted" | "note",
    by?: string,                 // admin id
    note?: string,
    screenshotUrl?: string,
    at: string
  }],
  rejectionReason?: string,
  consents: {
    termsAccepted: boolean,
    dataSharingAccepted: boolean,
    verificationAccepted: boolean,
    acceptedAt: string
  },
  submittedAt?: string,          // first/last application submit
  createdAt: string,
  updatedAt: string,
  verifiedAt?: string
}
```

**Cloudinary path:** `find-near-doctor/dev/doctors/{phone_digits}/{file}` — URLs stored in `documents[]`.

**Indexes:** `id` (unique), `phone` (unique sparse), `status`, `registrationNumber + stateMedicalCouncil` (unique)

See [onboarding-data-model.md](./onboarding-data-model.md) for step-by-step field mapping.

## `admins`

```typescript
{
  id: string,
  username: string,              // unique
  passwordHash: string,        // bcrypt
  name: string,
  role: "admin" | "superadmin",
  createdAt: string,
  lastLoginAt?: string
}
```

## `otps`

```typescript
{
  phone: string,
  codeHash: string,              // bcrypt hash of 6-digit OTP
  purpose: "doctor_login" | "doctor_signup",
  attempts: number,
  createdAt: Date,               // TTL index: expireAfterSeconds 600
  expiresAt: Date
}
```

## `verification_audit`

```typescript
{
  id: string,
  doctorId: string,
  adminId?: string,              // omitted on doctor submit
  action: "submitted" | "approved" | "rejected" | "note",
  registrationNumber: string,
  note?: string,
  rejectionReason?: string,
  wmbcScreenshotUrl?: string,
  createdAt: string
}
```

---

## External services (in use)

| Need | Service | Env vars |
|------|---------|----------|
| **Database** | MongoDB Atlas | `MONGODB_URI`, `MONGODB_DB_NAME` |
| **Photos / PDFs** | Cloudinary | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Doctor OTP SMS** | MSG91 (~₹0.15–0.25/SMS) | `SMS_DEV_MODE`, `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID` |
| **Admin login** | Built-in JWT | `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` |

**Why not store files in MongoDB?** Atlas free tier is 512MB; PDFs and photos bloat the cluster. Store Cloudinary URLs only.

Setup guide: [services-setup.md](./services-setup.md) · Full stack: [tech-stack.md](./tech-stack.md) · Onboarding: [onboarding-data-model.md](./onboarding-data-model.md)

---

## API routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/admin/login` | — | Username + password → JWT cookie |
| POST | `/api/auth/admin/logout` | admin | Clear cookie |
| GET | `/api/auth/admin/me` | admin | Current admin |
| POST | `/api/auth/doctor/otp/send` | — | Send OTP to phone |
| POST | `/api/auth/doctor/otp/verify` | — | Verify OTP → JWT cookie |
| POST | `/api/upload` | doctor/admin | Upload file → Cloudinary URL |
| POST | `/api/doctors/apply` | doctor | Submit onboarding (status: pending) |
| GET | `/api/admin/verifications` | admin | Pending doctors list |
| PATCH | `/api/admin/verifications/[id]` | admin | Approve or reject |
| PATCH | `/api/doctors/me/availability` | doctor | Update live status |

---

## Flow: doctor applies → admin approves

1. Doctor enters phone → `POST /api/auth/doctor/otp/send`
2. Doctor verifies OTP → `POST /api/auth/doctor/otp/verify` (JWT)
3. Doctor uploads docs → `POST /api/upload` (returns URLs)
4. Doctor submits form → `POST /api/doctors/apply` → `doctors` doc with `status: pending`
5. Admin logs in → `POST /api/auth/admin/login`
6. Admin reviews → `PATCH /api/admin/verifications/[id]` with `{ action: "approve" | "reject", note? }`
7. On approve: `status: verified`, `verifiedAt` set, audit record created
8. SMS notification (when MSG91 configured)

---

## `analytics_events`

Public traffic only (patient-facing pages). See [analytics.md](./analytics.md).

```typescript
{
  id: string,
  type: "page_view" | "search" | "doctor_profile_view",
  path: string,
  query?: string,
  sessionId: string,
  userAgent: string,
  device: "mobile" | "tablet" | "desktop" | "bot" | "unknown",
  referrer?: string,
  doctorId?: string,
  ipHash?: string,
  country?: string,
  metadata?: Record<string, string | number | boolean>,
  createdAt: Date   // TTL index: 90 days
}
```

**API:** `POST /api/analytics/event` · Admin: `GET /api/admin/analytics/summary?days=7`

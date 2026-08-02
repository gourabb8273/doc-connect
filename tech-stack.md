# DocConnect — Tech Stack

This document defines the technology choices for building the Doctor-Patient Connect platform described in [plan.md](./plan.md).

---

## Principles

- **Ship Phase 1 fast** — manual verification, ~10–20 seed doctors, simple dashboards
- **PWA first** — one Next.js/React app for desktop and mobile browsers; installable on home screen
- **One language end-to-end** — TypeScript across web and backend (mobile app evaluated in Phase 2)
- **Real-time by default** — live doctor availability is core product value
- **India-first** — OTP auth, WBMC verification, path to ABDM HPR
- **Document-friendly data** — doctor profiles vary widely; optional fields and visibility toggles map naturally to flexible schemas

---

## Stack Overview

| Layer | Choice |
|--------|--------|
| Client app (Phase 1) | **Next.js 15 PWA** — App Router + React + TypeScript |
| Native mobile app | **Phase 2 — TBD** (Expo/React Native vs continue PWA-only) |
| UI | Tailwind CSS + shadcn/ui |
| API | Next.js API routes / Server Actions (Phase 1) → NestJS (Phase 2+) |
| Database | **MongoDB Atlas** |
| Cache / pub-sub | Redis (Upstash) |
| Real-time | Socket.io or MongoDB Change Streams |
| File storage | AWS S3 or Cloudflare R2 |
| Auth | Phone OTP (MSG91) |
| Maps | Google Maps Platform |
| Hosting | Vercel (web) + MongoDB Atlas (Mumbai region) |
| Monorepo | Turborepo + pnpm |

---

## Why MongoDB

MongoDB is a good fit for this product:

- **Doctor profiles are documents** — name, specialization, fees, bio, languages, visibility toggles, and practice locations fit a single document model without heavy joins
- **Flexible onboarding** — mandatory vs optional fields (Section 3 of plan) evolve without migrations
- **Geospatial search** — `2dsphere` indexes support nearest-first doctor search by pincode/locality/coordinates
- **Unique constraints** — registration number enforced via a unique index (one council number → one account)
- **Verification audit trail** — nested arrays for submission history, ops notes, and WBMC screenshot references
- **Real-time status** — availability fields updated frequently; Change Streams can fan out to connected clients

### MongoDB patterns for key requirements

| Requirement | MongoDB approach |
|-------------|------------------|
| Unique registration number | `unique` index on `registrationNumber` + `stateMedicalCouncil` |
| Nearest-first search | GeoJSON `Point` on practice locations + `$geoNear` / `$near` |
| Pincode / locality / state filter | Compound indexes on `practiceLocations.pincode`, `locality`, `state` |
| Doctor visibility toggles | Embedded `visibility: { phone, fee, address, ... }` on profile |
| Live availability | Top-level `availabilityStatus` + `updatedAt`; Redis cache for hot reads |
| Verification workflow | `status: pending \| verified \| rejected` + `verificationHistory[]` |
| Document uploads | Store S3/R2 URLs + metadata on profile; never store binaries in MongoDB |

### Atlas recommendations

- **Cluster region:** AWS Mumbai (`ap-south-1`) for latency and data residency
- **Tier:** M10+ when going to production; M0/M2 for dev
- **Backup:** Continuous cloud backup enabled before launch
- **Search (optional Phase 2):** MongoDB Atlas Search for full-text doctor/specialization search

---

## Frontend — Phase 1 PWA (Next.js + React)

Phase 1 ships as a **Progressive Web App** — one codebase for desktop, tablet, and mobile browsers. Doctors and patients use the same app; no separate native build required at launch.

### Core stack

- **Next.js 15** with App Router, React Server Components where useful
- **TypeScript** strict mode
- **Tailwind CSS + shadcn/ui** — accessible components, large touch targets for doctor dashboard
- **React Hook Form + Zod** — form validation (onboarding, profile edits)
- **TanStack Query** — client-side data fetching and cache for search/dashboard

### PWA capabilities

- **Web App Manifest** — app name, icons, theme colour, `display: standalone`
- **Service worker** via **Serwist** (`@serwist/next`) — offline shell, asset caching
- **Add to Home Screen** — doctors can pin the dashboard like an app on Android/iOS
- **Responsive + mobile-first** — all flows optimised for phone browsers (primary doctor device)
- **Web Push (optional Phase 1)** — verification approve/reject notifications via service worker; fallback to SMS if not enabled

PWA scope for Phase 1:

| Feature | PWA support |
|---------|-------------|
| Patient search & profiles | Yes |
| Doctor dashboard & status updates | Yes |
| Doctor onboarding + document upload | Yes (camera via `<input capture>`) |
| Real-time availability | Yes (Socket.io in browser) |
| Offline browse | Cached shell only; search requires network |
| App Store presence | No — browser install only |

Routes (initial):

```
/                     → Patient search (public)
/doctors/[id]         → Doctor profile (public)
/doctor/dashboard     → Doctor self-service
/doctor/onboarding    → Sign-up flow
/admin                → Ops verification dashboard
/admin/verifications  → Review queue
```

### Phase 2 — Native mobile app (evaluate later)

After Phase 1 launch and usage data, decide whether a native app is needed:

- **Option A — Stay PWA-only** — if home-screen install + web push covers doctor/patient needs
- **Option B — Expo (React Native)** — if App Store/Play Store distribution, richer push, or offline is required

If Option B is chosen, reuse shared `packages/types` and `packages/api-client` from the monorepo. Native app is not in scope for Phase 1.

---

## Backend

### Phase 1 — Next.js full-stack

Keep everything in one repo for speed:

- **Server Actions / Route Handlers** for CRUD
- **Zod** for request validation
- **MongoDB driver** (`mongodb` package) or **Mongoose** for schema + middleware

### Phase 2+ — NestJS service (when complexity grows)

Extract when you need:

- ABDM HPR integration
- Background job workers
- Admin API with fine-grained RBAC
- WebSocket gateway at scale

NestJS modules map cleanly: `doctors`, `verification`, `search`, `admin`, `integrations/abdm`.

---

## Data Model (MongoDB collections)

High-level schema — not exhaustive:

### `doctors`

```typescript
{
  _id: ObjectId,
  phone: string,                    // verified, indexed
  name: string,
  photoUrl: string,                 // mandatory
  registrationNumber: string,       // unique with council
  stateMedicalCouncil: string,      // e.g. "WBMC"
  specialization: string,
  yearsOfExperience?: number,
  status: "pending" | "verified" | "rejected" | "suspended",
  availabilityStatus: "available" | "busy" | "delayed" | "on_leave",
  practiceLocations: [{
    name: string,
    address: string,
    locality: string,
    pincode: string,
    state: string,
    location: { type: "Point", coordinates: [lng, lat] },
    consultationType: "in_person" | "online" | "both"
  }],
  visibility: {
    showPhone: boolean,
    showFee: boolean,
    showExactAddress: boolean,
    // ...
  },
  consultationFee?: number,
  bio?: string,
  documents: [{
    type: "registration_cert" | "degree" | "govt_id" | "selfie",
    url: string,
    uploadedAt: Date
  }],
  verificationHistory: [{
    action: string,
    by: string,           // admin user id
    note?: string,
    screenshotUrl?: string,
    at: Date
  }],
  createdAt: Date,
  updatedAt: Date,
  verifiedAt?: Date
}
```

### `verification_audit`

Separate collection for ops audit records (WBMC screenshot, cross-check notes) — keeps doctor doc lean.

### `otps`

TTL index for ephemeral OTP records (auto-expire after 10 minutes).

### `admins`

Ops team users with role-based permissions.

---

## Authentication

| Actor | Method |
|-------|--------|
| Doctors | Phone + OTP via **MSG91** |
| Admins | Email/password or SSO (Google Workspace) + MFA |
| Patients | No login required for browse/search (Phase 1); optional account later |

Flow:

1. Doctor enters phone → OTP sent via MSG91
2. OTP verified → JWT session (httpOnly cookie in PWA browser context)
3. Rate-limit OTP requests via Redis

---

## Real-Time Availability

Doctor status updates must reflect quickly for patients.

**Phase 1 approach:**

1. Doctor updates status via dashboard → write to MongoDB
2. **Socket.io** room per locality or broadcast on search page
3. **Redis** cache latest status per doctor (TTL + invalidate on write)

**Alternative:** MongoDB Change Streams → push to Socket.io (no polling)

Target: status visible to patients within **< 2 seconds**.

---

## File Storage

| Type | Storage |
|------|---------|
| Doctor photo, certs, IDs | S3 / Cloudflare R2 |
| WBMC verification screenshots | S3 / R2 (admin uploads) |

- Presigned URLs for direct browser upload
- Max file size limits; allow PDF, JPG, PNG only
- Virus scan hook (Phase 2) via Lambda/Cloudflare Worker

---

## Search & Discovery

Patient search filters (from plan):

- Pincode, locality, state
- Nearest-first (geospatial)
- Specialization (optional filter)

**Query strategy:**

```javascript
// Example: doctors near a point, verified only
db.doctors.find({
  status: "verified",
  "practiceLocations.location": {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 10000  // metres
    }
  }
})
```

Combine with pincode/state filters via `$match` in aggregation pipeline.

**Phase 2:** Atlas Search for fuzzy name/specialization matching.

---

## Admin & Verification (Phase 1)

Built into the same Next.js app under `/admin`:

- Queue of `status: "pending"` doctors
- View submitted documents + registration details
- Manual WBMC cross-check workflow (ops opens portal, marks approve/reject)
- Upload/link WBMC screenshot to audit record
- Approve → `status: "verified"`, profile goes live
- Reject → notify doctor with reason

No separate admin tool needed for launch.

---

## External Integrations

| Integration | Phase | Provider |
|-------------|-------|----------|
| SMS OTP | 1 | MSG91 |
| Maps / geocoding | 1 | Google Maps Platform |
| WBMC manual check | 1 | Ops team (no API) |
| ABDM HPR verification | 3 | Government HPR API |
| Payments (if needed) | TBD | Razorpay |

---

## Infrastructure

| Service | Provider | Region |
|---------|----------|--------|
| Web hosting | Vercel | Edge + Mumbai |
| Database | MongoDB Atlas | ap-south-1 (Mumbai) |
| Redis | Upstash | ap-south-1 |
| Object storage | AWS S3 or Cloudflare R2 | ap-south-1 |
| Error tracking | Sentry | — |
| Uptime | Better Stack | — |

Environment variables managed via Vercel env + Atlas IP allowlist.

---

## Monorepo Structure

```
doc-connect/
├── apps/
│   └── web/              # Next.js PWA — patient search, doctor dashboard, admin
├── packages/
│   ├── db/               # MongoDB models, indexes, migrations
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components (web)
│   └── api-client/       # Typed fetch wrapper
├── services/
│   └── api/              # NestJS — Phase 2+ (optional split)
├── plan.md
├── tech-stack.md
└── turbo.json
```

---

## Key Libraries

| Purpose | Library |
|---------|---------|
| PWA / service worker | `@serwist/next` |
| MongoDB ODM | Mongoose or native `mongodb` driver |
| Validation | Zod |
| Auth sessions | jose (JWT) or NextAuth (custom credentials for OTP) |
| Real-time | socket.io |
| Maps | @react-google-maps/api |
| Forms | react-hook-form |
| Testing | Vitest + Playwright |
| Linting | ESLint + Prettier |

---

## Phased Stack Rollout

### Phase 1 — Seed & Manual (Launch)

- **Next.js PWA** — single installable app for patients, doctors, and admin
- Next.js full-stack + MongoDB Atlas + Redis + S3 + MSG91
- Admin verification in `/admin`
- Socket.io for live status
- Serwist service worker + web manifest (Add to Home Screen)
- Mobile = mobile browser + PWA install (no native app)

### Phase 2 — Public Self-Serve + Mobile Decision

- Open doctor registration (OTP + captcha)
- Atlas Search for better discovery
- NestJS split if API surface grows
- **Evaluate native mobile app** (Expo vs PWA-only) based on Phase 1 usage

### Phase 3 — Automated Verification

- ABDM HPR API integration in NestJS
- Auto-verify with HPR ID; manual fallback unchanged
- BullMQ job queue for async verification + re-verification reminders

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary database | MongoDB | Flexible doctor profiles, geo queries, document-style audit trails |
| SQL vs NoSQL | MongoDB over PostgreSQL | Profile variability and nested practice locations outweigh relational needs for Phase 1 |
| Phase 1 client | Next.js PWA | One codebase, installable, no App Store dependency |
| Native mobile | Deferred to Phase 2 | Evaluate after launch; Expo is leading option if needed |
| Phase 1 backend | Next.js monolith | Fastest path to launch |
| OTP provider | MSG91 | India-focused, cost-effective |
| Real-time | Socket.io + Redis | Proven, simple, works with MongoDB writes |

---

*Last updated: August 2026 — aligned with [plan.md](./plan.md).*

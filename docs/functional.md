# DocConnect — Functional Plan

Detailed build plan for Phase 1: what we build, how it works, and the two user journeys (Patient + Doctor), plus the admin approval flow.

Related docs: [plan.md](./plan.md) (requirements) · [tech-stack.md](./tech-stack.md) (implementation stack)

---

## Product Vision (in the app)

Every screen should reinforce one idea:

> **Find verified, real doctors near you — see who's available right now.**

| Principle | What it means in UI |
|-----------|---------------------|
| **Verified** | Only admin-approved doctors appear in patient search. Verified badge on profile. |
| **Real** | Registration number checked against State Medical Council (WBMC). Doctor photo required. |
| **Available now** | Live status (Available / Busy / Delayed / On Leave) — not a stale directory. |
| **Doctor in control** | Doctor chooses what patients see (phone, fee, address). Consent before anything goes public. |
| **Simple** | Minimal steps, plain language, large buttons. No clutter. |

**Tagline direction (pick one at build time):**  
*"Connect to care you can trust."* / *"Verified doctors. Available now."*

---

## One App, Two Audiences

### Recommendation: **Yes — "Join as Doctor" lives in the same PWA**

Phase 1 is a single **Next.js PWA**. Patients and doctors use the **same website/app**, not two separate products.

```
┌─────────────────────────────────────────────────────────┐
│  DocConnect                              [Join as Doctor]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│   PATIENT HOME (default)          DOCTOR AREA (gated)   │
│   /                               /doctor/*             │
│   - Search doctors                - Login (OTP)         │
│   - View profiles                 - Onboarding          │
│   - No login needed               - Dashboard           │
│                                                         │
│   ADMIN (you only)                /admin/*              │
│   - Pending requests                                    │
│   - Approve / Reject                                    │
└─────────────────────────────────────────────────────────┘
```

**Why same UI:**

- One deploy, one brand, one URL — easier for doctors you onboard by link
- Patient search stays the homepage; doctors enter via **"Join as Doctor"** in the header
- After doctor OTP login, they land on **Doctor Dashboard** — not the patient search
- Shared design system (minimal, calm, trustworthy)

**What changes by role:**

| Area | Patient (public) | Doctor (logged in) | Admin (you) |
|------|------------------|--------------------|-------------|
| Home | Search & results | Redirect to dashboard | Admin queue |
| Nav | Search, Join as Doctor | Dashboard, Profile, Status | Pending, Approved, Settings |
| Login | Not required | Phone OTP | Email/password (you only) |

---

## Design Principles — Minimal & Simple

- **Mobile-first** — most doctors will use phone browser or installed PWA
- **One primary action per screen** — e.g. "Search", "Submit for review", "Mark Available"
- **Large touch targets** — min 44px buttons, generous spacing
- **Plain language** — "Available now" not "Status: ACTIVE"; "Join as Doctor" not "Provider registration"
- **Calm palette** — white/light grey background, one accent colour (e.g. teal or blue for trust), green for "Available", muted red for "On Leave"
- **No dashboards full of charts** — doctor sees: status toggle, profile summary, visibility switches
- **Progressive disclosure** — onboarding in short steps (3–4 screens), not one long form

---

## Doctor Status Lifecycle

Controls what each role sees at every stage.

```
                    ┌──────────────┐
                    │  Not signed  │
                    │     up       │
                    └──────┬───────┘
                           │ OTP + onboarding submit
                           ▼
                    ┌──────────────┐
         ┌─────────│   PENDING    │─────────┐
         │         │  (review)    │         │
         │         └──────┬───────┘         │
         │ reject         │ approve         │ edit & resubmit
         ▼                ▼                 │
  ┌──────────────┐ ┌──────────────┐         │
  │   REJECTED   │ │   VERIFIED   │◄────────┘
  │ (with reason)│ │   (live)     │
  └──────────────┘ └──────┬───────┘
                          │ core identity change
                          ▼
                    ┌──────────────┐
                    │   PENDING    │  (re-verification)
                    │  (review)    │
                    └──────────────┘
```

| Status | Patient search | Doctor dashboard | Admin |
|--------|----------------|------------------|-------|
| `pending` | **Hidden** | "Under review" + read-only preview | In approval queue |
| `verified` | **Visible** (per visibility toggles) | Full dashboard | Listed as approved |
| `rejected` | Hidden | Reason shown + "Fix & resubmit" | In rejected list |

**Decision (Phase 1):** Profile is **fully hidden** from patients until you approve. No "pending" badge in public search.

---

# Journey 1 — Patient (User)

**Goal:** Find a verified doctor nearby, see if they're available, view only what the doctor allowed, contact or visit.

**Login:** None required in Phase 1.

---

## P1.1 — Landing / Search (Home)

**Route:** `/`

**What the user sees:**

- Short vision line: *"Find verified doctors near you"*
- Search box or filters:
  - Pincode **or** Locality **or** State (start with one primary: pincode)
  - Optional: Specialization dropdown
- "Search" button
- Optional: "Use my location" for nearest-first (browser geolocation permission)

**What we build:**

- Search form component
- API: `GET /api/doctors/search?pincode=&locality=&state=&specialization=&lat=&lng=`
- Only returns doctors with `status: verified`
- Results sorted by distance when lat/lng provided, else by locality match
- Real-time status badge on each card (via Socket.io or polling every 30s)

---

## P1.2 — Search Results

**Route:** `/search?...` (or same page with results below)

**Each doctor card shows:**

- Photo, name, specialization
- **Verified** badge
- **Live status** pill: Available / Busy / Delayed / On Leave
- Locality (or pincode) — not full address unless doctor allowed
- Fee — **only if** doctor enabled `showFee`
- Consultation type: In-person / Online / Both

**Card tap** → Doctor profile page.

**Empty state:** *"No verified doctors in this area yet. Check back soon."*

---

## P1.3 — Doctor Profile (Public Preview)

**Route:** `/doctors/[id]`

**Always shown (verified doctors):**

- Photo, full name, specialization, years of experience
- Verified badge + registration number (public trust signal)
- Live availability status (large, colour-coded)
- Consultation type

**Shown only if doctor consented (visibility toggle ON):**

- Phone → tap to call (`tel:` link)
- Consultation fee
- Full clinic address + map pin
- Bio, languages, qualifications

**If toggle OFF:**

- Show locality only (e.g. "Salt Lake, Kolkata") — never exact address
- Hide phone / fee rows entirely (don't show "hidden")

**Actions for patient:**

- Call (if phone visible)
- Open in maps (if address visible)
- No booking, no payment in Phase 1

---

## P1.4 — Patient Journey Summary

| Step | Screen | Action |
|------|--------|--------|
| 1 | Home | Enter pincode/locality → Search |
| 2 | Results | Browse cards, see live status |
| 3 | Profile | View doctor-approved details, call if allowed |

**Out of scope Phase 1:** Patient accounts, favourites, reviews, appointment booking, payments.

---

# Journey 2 — Doctor

**Goal:** Register with minimal friction, submit details + documents, wait for your approval, then manage profile and live status.

**Entry:** **"Join as Doctor"** link in header → `/doctor` or `/doctor/login`

---

## D2.1 — Doctor Entry / Login

**Route:** `/doctor/login`

**Screen:**

- Heading: *"Join DocConnect"*
- Subtext: *"List your practice. We verify every doctor manually."*
- Phone number input
- "Send OTP" → OTP input → "Continue"
- Link: *"Already registered? Log in"* (same flow)

**After OTP:**

- New doctor → onboarding wizard
- Returning doctor → dashboard (based on status)

---

## D2.2 — Onboarding Wizard (Simple Steps)

Multi-step form — **one step per screen**, progress indicator (Step 1 of 4).

### Step 1 — Basic Info *(mandatory)*

| Field | Required | Notes |
|-------|----------|-------|
| Full name | Yes | Must match council registration |
| State Medical Council | Yes | Default: West Bengal (WBMC) |
| Registration number | Yes | Unique in system |
| Specialization | Yes | Dropdown + optional free text |
| Years of experience | No | Optional |

### Step 2 — Photo & Documents *(mandatory photo + reg cert)*

| Field | Required | Notes |
|-------|----------|-------|
| Profile photo | **Yes** | Camera or gallery; face visible |
| Registration certificate | **Yes** | PDF or image |
| Degree certificate | No | Helps verification |
| Govt ID (Aadhaar/PAN) | No | Phase 1 optional |
| Selfie | No | Recommended for identity match |

Upload → presigned S3/R2 URL → save reference in MongoDB.

### Step 3 — Practice Location *(mandatory at least one)*

| Field | Required | Notes |
|-------|----------|-------|
| Clinic / hospital name | Yes | |
| Address | Yes | Used for verification |
| Locality | Yes | Shown when exact address hidden |
| Pincode | Yes | Used for patient search |
| State | Yes | |
| Map pin | Yes | Drag pin or geocode from address |
| Consultation type | Yes | In-person / Online / Both |

### Step 4 — Optional Details + Consent *(mandatory consent checkbox)*

| Field | Required | Notes |
|-------|----------|-------|
| Consultation fee | No | |
| Bio | No | |
| Languages | No | |
| Qualifications | No | |

**Consent block (mandatory before submit):**

```
☐ I confirm the information provided is true and I am a registered
  medical practitioner.

☐ I understand my profile will be reviewed manually before it appears
  in public search.

☐ I agree to DocConnect's terms and consent to display my profile
  details as I choose in my dashboard settings.
```

**Visibility defaults (doctor can change later in dashboard):**

| Field | Default visibility |
|-------|-------------------|
| Name, photo, specialization, verified badge | Always public (when verified) |
| Registration number | Public (trust) |
| Phone | **Off** — doctor must opt in |
| Fee | **Off** |
| Exact address | **Off** — show locality only |
| Bio, languages | **On** if filled |

**Submit button:** *"Submit for verification"*

**After submit:**

- Status → `pending`
- Screen: *"Thank you. We're reviewing your profile. You'll be notified when approved."*
- Doctor can still log in → limited dashboard (preview only)
- **Notification on decision:** SMS + in-app banner when you approve or reject

---

## D2.3 — Pending State (Doctor Waiting)

**Route:** `/doctor/dashboard` (when `status: pending`)

**What doctor sees:**

- Banner: *"Your profile is under review"*
- Read-only preview of submitted profile (as patients **will** see it once approved)
- No status toggle, no public visibility yet
- Edit button for non-identity fields? **Phase 1: locked until rejected or approved** (keeps review snapshot clean). If rejected → unlock for fix.

---

## D2.4 — Rejected State

**Route:** `/doctor/dashboard` (when `status: rejected`)

**What doctor sees:**

- Red banner with **your rejection reason** (free text from admin)
- *"Fix & resubmit"* → opens onboarding steps with pre-filled data
- Resubmit → back to `pending`

---

## D2.5 — Verified Doctor Dashboard

**Route:** `/doctor/dashboard` (when `status: verified`)

This is the **main doctor home** after your approval.

### Block A — Live Status (most important, top of page)

Large toggle or 4-button selector:

| Status | Patient sees |
|--------|--------------|
| Available Now | Green pill |
| Busy | Amber |
| Delayed | Orange + optional note |
| On Leave | Grey |

One tap to update → writes to MongoDB → Socket.io pushes to search/results.

**Optional:** "Update location for today" — temporary pin if seeing patients elsewhere (Phase 1 nice-to-have; can defer).

### Block B — Profile Summary

- Photo, name, specialization
- Link: *"Edit profile"* → `/doctor/profile`

### Block C — Visibility Controls (Consent per field)

Simple on/off switches:

| Toggle | Label |
|--------|-------|
| Show phone number | *"Let patients call me"* |
| Show consultation fee | *"Show my fee"* |
| Show exact address | *"Show full clinic address"* (off = locality only) |
| Show bio | *"Show bio"* |

Changes save immediately. Patient profile reflects toggles in real time.

### Block D — Edit Profile

**Route:** `/doctor/profile`

- Edit fee, bio, languages, location, photo
- **Core identity fields** (name, registration number) → editing triggers warning: *"This will require re-verification"* → status back to `pending`, hidden from search until you approve again

---

## D2.6 — Doctor Journey Summary

| Step | Screen | Outcome |
|------|--------|---------|
| 1 | Join as Doctor → OTP | Authenticated |
| 2 | Onboarding (4 steps) | Data + docs saved |
| 3 | Consent + Submit | Status = `pending` |
| 4 | Wait | Hidden from patient search |
| 5 | You approve | Status = `verified` |
| 6 | Dashboard | Update status + visibility toggles |
| 7 | Patient search | Profile visible per toggles |

---

# Journey 3 — Admin (You)

**Goal:** Review pending doctor submissions with full context, check WBMC manually, approve or reject with reason.

**Route:** `/admin` (protected — only your account)

---

## A3.1 — Admin Login

- Email + password (or Google SSO — your choice)
- Not linked to doctor OTP flow
- Phase 1: single admin user (you)

---

## A3.2 — Pending Requests Queue

**Route:** `/admin/verifications`

**List view:**

| Column | Content |
|--------|---------|
| Submitted | Date/time |
| Name | Doctor name |
| Registration # | WBMC number |
| Specialization | |
| Locality | |
| Actions | **Review** button |

Sort: oldest first. Badge count: *"3 pending"*.

---

## A3.3 — Review Detail (Core Admin Screen)

**Route:** `/admin/verifications/[id]`

**Layout: split or stacked — all info needed to decide without leaving the page**

### Left / Top — Submitted Details

- Full name, phone, registration number, council, specialization, experience
- Practice: clinic name, full address, pincode, map
- All uploaded documents: **inline preview** (photo, reg cert, degree, ID)
- Consent timestamp
- Submission history (if resubmitted)

### Right / Side — Your Verification Checklist

Manual WBMC check (Phase 1):

1. Open [wbmc.wb.gov.in](https://wbmc.wb.gov.in) (link opens new tab)
2. Search registration number
3. Confirm: name match, status = Registered, qualification reasonable

**Admin actions on this screen:**

| Action | UI |
|--------|-----|
| **Approve** | Green button → optional note → doctor `verified`, appears in search; **SMS + in-app notification** |
| **Reject** | Red button → **reason required** (textarea) → **SMS + in-app notification** with reason |
| **Save WBMC screenshot** | Upload audit screenshot → stored in S3, linked to audit record |

**Approve confirmation modal:**

*"This doctor will appear in public search immediately (subject to their visibility settings). Confirm?"*

---

## A3.4 — Other Admin Views

| Route | Purpose |
|-------|---------|
| `/admin/doctors` | All verified doctors — search, suspend if needed |
| `/admin/doctors/[id]` | View live profile, force re-verification |
| `/admin/rejected` | Rejected submissions archive |

---

## A3.5 — Admin Journey Summary

| Step | Action |
|------|--------|
| 1 | Log in to `/admin` |
| 2 | See pending queue |
| 3 | Open review → compare docs vs WBMC portal |
| 4 | Upload screenshot (audit) |
| 5 | Approve or Reject with reason |
| 6 | Approved doctor → visible on patient home/search |

---

# Screen Inventory (Phase 1 Build List)

| # | Route | Role | Priority |
|---|-------|------|----------|
| 1 | `/` | Patient | P0 |
| 2 | `/search` | Patient | P0 |
| 3 | `/doctors/[id]` | Patient | P0 |
| 4 | `/doctor/login` | Doctor | P0 |
| 5 | `/doctor/onboarding` | Doctor | P0 |
| 6 | `/doctor/dashboard` | Doctor | P0 |
| 7 | `/doctor/profile` | Doctor | P0 |
| 8 | `/admin/login` | Admin | P0 |
| 9 | `/admin/verifications` | Admin | P0 |
| 10 | `/admin/verifications/[id]` | Admin | P0 |
| 11 | `/admin/doctors` | Admin | P1 |

**Global components:** Header (logo, Join as Doctor, admin link hidden), footer (vision one-liner, contact).

---

# What to Build — Suggested Order

### Sprint 1 — Foundation
- Next.js PWA shell, design tokens, header/footer
- MongoDB doctor model + indexes
- Patient home + search API (empty results OK)
- Admin auth (you only)

### Sprint 2 — Doctor Onboarding
- OTP login (MSG91)
- 4-step onboarding wizard
- Document upload to S3/R2
- Submit → `pending` status

### Sprint 3 — Admin Approval
- Pending queue + review detail page
- Approve / reject API
- Document preview, rejection reason, audit screenshot upload

### Sprint 4 — Live Doctor Experience
- Doctor dashboard: status toggle, visibility switches
- Socket.io for live status on search + profile
- Edit profile + re-verification trigger

### Sprint 5 — Polish
- PWA manifest + Add to Home Screen
- Empty states, error states, SMS on approve/reject
- Seed 10–20 doctors with real data

---

# Data Rules (Quick Reference)

### Mandatory to submit onboarding

- Phone (OTP verified)
- Full name
- Registration number + council
- Specialization
- Profile photo
- Registration certificate
- At least one practice location (address, locality, pincode, state, map pin)
- Consent checkbox

### Always public (when verified)

- Name, photo, specialization, experience (if provided)
- Verified badge + registration number
- Live availability status
- Consultation type
- Locality (minimum location)

### Doctor-controlled (visibility toggle)

- Phone, fee, exact address, bio, languages

---

# Confirmed Decisions (Phase 1)

| Decision | Choice |
|----------|--------|
| Join as Doctor | **Same PWA** — header link, doctor area at `/doctor/*` |
| Unapproved doctors | **Fully hidden** from patient search until you approve |
| Patient login | **Not required** — open search and profiles for everyone |
| Approve/reject notify | **SMS (MSG91) + in-app** — banner/status on doctor dashboard |
| Fee display | Informational only — no payments |
| Primary use case | Clinic + live status — not home-visit GPS tracking |
| Edit while pending | Locked until approved or rejected |
| Brand name | DocConnect (working title) |

---

# Open Questions (Still TBD)

| # | Question | Notes |
|---|----------|-------|
| 1 | Re-verification cadence | Annual reminder vs only on identity change |
| 2 | Appointment booking | Phase 2+ or never? |
| 3 | Exact brand name | DocConnect vs alternatives in plan.md |

---

# Answer: Should "Join as Doctor" Be in the Same UI as the Patient App?

**Yes — recommended for Phase 1.**

- **Same PWA, same domain** — e.g. `docconnect.in` with patient search at `/` and doctor area at `/doctor/*`
- **"Join as Doctor"** in the top-right of every public page — visible but not competing with search
- Doctors are not patients in the same session; after OTP they enter a **separate doctor shell** (different nav, no search bar)
- Avoid a second website or app for doctors at launch — doubles maintenance for no gain at 10–20 doctors
- Later (Phase 2): optional `doctor.docconnect.in` subdomain that redirects to `/doctor` if you want a dedicated link for outreach

---

*Last updated: August 2026 — Phase 1 PWA, manual verification, MongoDB backend.*

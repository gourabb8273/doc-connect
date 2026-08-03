# Doctor-Patient Connect App — Requirements Document

## Vision — Why We're Building This

Finding the right doctor, at the right time, nearby, is harder than it should be. Patients often don't know who's available, whether a doctor is currently seeing patients, what their fees are, or even how to reach them — especially outside big hospital networks, in localities and smaller towns. Information is scattered, outdated, or simply doesn't exist online.

This platform exists to close that gap — a trusted community that **connects** patients directly with **verified, real** doctors around them, with live, accurate details: who's available right now, where, at what cost, and how to reach them. Not a directory that goes stale, but a living, real-time bridge between doctor and patient.

The name should reflect this core idea of **connection** — bringing doctor and patient together, simply and reliably. Working direction: something built around "Connect" (e.g., **DocConnect**, **CareConnect**, **CureConnect**, **ConnectDoc**) — a name evaluation/shortlist can be done separately, but the brand identity should center on this idea of *bridging the gap* to finding real, available care.

---

## 1. Platform & Devices

- **Web app**: fully **responsive**, works well across desktop, tablet, and mobile browsers
- **Mobile app**: native/hybrid mobile app planned alongside the web app, for both doctors and patients
- Core experience (search, profile, real-time status) should be consistent across web and mobile — no feature gap between platforms
- UI should stay simple and lightweight, especially for doctors, since many may not be highly tech-savvy — minimal steps, large touch targets, clear language

---

## 2. Doctor Verification (Trust & Safety Layer)

**Problem:** Anyone could claim to be a doctor. Need to validate real medical registration before a profile goes live.

- Doctor submits their State Medical Council registration number (e.g., WBMC) at sign-up along with supporting documents.
- **Manual verification (Phase 1):** Ops team searches the doctor's registration number on the official West Bengal Medical Council portal (`wbmc.wb.gov.in`), cross-checks name, qualification, address, and registration status ("Registered" = active).
- Screenshot of verification result saved as an audit record.
- Registration number enforced as **unique** in the database — one number can only ever be linked to one doctor account, preventing duplicate/fraudulent use of the same registration.
- **Future (Phase 2):** Integrate ABDM's Healthcare Professionals Registry (HPR) API for automated, government-backed verification via Aadhaar eKYC, reducing manual review load as volume grows.
- Doctors without HPR ID continue through manual review as a fallback.

---

## 3. Doctor Onboarding — User Journey

**Public & self-serve** — open to any doctor, not invite-only (aside from a small manually-onboarded seed group at launch).

### Stage 1: Sign-up (doctor self-service)
- Phone number + OTP verification
- Basic details: Name, registration number, state medical council, specialization, years of experience
- Document upload: registration certificate, degree certificate, selfie, govt ID (Aadhaar/PAN)
- Practice details: clinic/hospital name, address, consultation type (in-person/online/both)
- Status: **Pending Verification** — doctor can log in, but profile is not public yet

**Mandatory fields (cannot submit/go live without these):**
- Doctor's **photo — mandatory** (no anonymous/blank-profile doctors; builds patient trust and helps with identity matching during verification)
- Full name
- Registration number + issuing state medical council
- Specialization
- Phone number (verified via OTP)
- At least one practice location/address
- Registration certificate upload (for verification)

**Optional / doctor's choice fields** (doctor controls whether shown publicly — see Section 4):
- Consultation fee
- Detailed bio
- Additional qualifications
- Languages spoken
- Exact address vs. locality-only display

### Stage 2: Verification (ops team)
- Manual registry cross-check (as above)
- Approve → status becomes Verified, profile goes live
- Reject → doctor notified with reason, can resubmit corrected info

### Stage 3: Profile completion (doctor self-service)
- Photo, bio, education, languages spoken
- Clinic/practice location (pin on map)
- Availability & time slots
- Consultation fee & payment details (if platform handles payments)

### Stage 4: Go live
- Verified + complete profile → doctor appears in public patient search

### Stage 5: Ongoing management
- Doctor can update phone, location, fees, availability anytime from their dashboard
- Changes to **core identity fields** (name, registration number) should trigger re-verification
- Periodic re-verification reminder (e.g., annually) recommended, since registrations can lapse or be suspended

---

## 4. Doctor Control & Consent (Simple, Doctor-First UI)

Keep the doctor-facing UI **simple**, with doctor in control of what's public:

- Doctor gives explicit **consent** before any detail is shown publicly (phone, fee, address, etc.)
- Doctor can **toggle visibility** per field — e.g., choose to show fee or not, show phone or hide it, show exact address or just locality
- Platform provides the option/controls; doctor decides what to showcase
- Doctor should be able to **real-time update**:
  - Current location (if operating from a different place that day)
  - Availability status — e.g., mark themselves as "Available Now," "Delayed," "On Leave," "Busy"
  - Time/schedule changes on the fly

This real-time status is core to the platform's value — patients should see who's *actually* available right now, not just a static schedule.

---

## 5. Patient-Facing Search & Discovery

- Patients can search doctors by:
  - **Pincode**
  - **Locality**
  - **State**
  - Nearest-first (location-based sorting)
- Doctor profile shows all doctor-approved details:
  - Name, photo, qualification, specialization, experience
  - Registration number (verified badge)
  - Live availability status
  - Location/clinic address
  - Phone (if doctor chooses to show)
  - Fee (if doctor chooses to show)
  - Consultation type (in-person/online)

No login/account friction assumed for basic browsing — public visibility for patients (to be confirmed as you finalize product decisions).

---

## 6. Open Decisions (To finalize as you build)

- [ ] Should a doctor's profile be **fully hidden** until verification is approved, or **visible with a "Pending Verification" badge**?
- [ ] Is the primary use case **appointment booking** (clinic-based), **real-time location tracking** (home-visit/mobile doctors), or **both**?
- [ ] Will the platform handle **payments/fees directly**, or is fee display just informational?
- [ ] What's the **re-verification cadence** for existing doctors (annual? on profile change only?)

---

## 7. Phased Rollout Plan

**Phase 1 — Seed & Manual (Launch)**
- Manually onboard first ~10–20 doctors (personal outreach/vouching)
- Manual WBMC verification for all
- Simple doctor dashboard: profile, visibility toggles, real-time status update
- Simple patient search: pincode/locality/state

**Phase 2 — Public Self-Serve**
- Open public doctor registration form (with OTP + captcha to prevent spam/bot abuse)
- Admin verification dashboard for ops team to review submissions quickly
- Continue manual WBMC checks

**Phase 3 — Automated Verification**
- Integrate ABDM Healthcare Professionals Registry (HPR) API
- Auto-verify doctors with existing HPR ID; manual review remains fallback for others

---

*Document based on discussion — West Bengal doctor-patient connect app, August 2026.*
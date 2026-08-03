# Find Near Doctor — Documentation

All project documentation lives in this folder.

## Product & planning

| Document | Description |
|----------|-------------|
| [plan.md](./plan.md) | Product vision, doctor onboarding requirements, phased rollout |
| [functional.md](./functional.md) | Phase 1 build plan, patient/doctor/admin user journeys |

## Technical

| Document | Description |
|----------|-------------|
| [tech-stack.md](./tech-stack.md) | Stack choices, libraries, infrastructure, budget estimates |
| [database-schema.md](./database-schema.md) | MongoDB collections, indexes, API routes |
| [api-database-plan.md](./api-database-plan.md) | Full ERD, schemas, API reference, implementation status |
| [onboarding-data-model.md](./onboarding-data-model.md) | How each onboarding step maps to DB + Cloudinary |
| [services-setup.md](./services-setup.md) | MongoDB Atlas, Cloudinary, MSG91, Netlify — keys & costs |
| [analytics.md](./analytics.md) | Public traffic tracking, user agent, sessions (MongoDB) |

## Quick links

- **App code:** `apps/web/`
- **Env template:** `apps/web/env.example`
- **Seed DB:** `cd apps/web && npm run db:setup`

## External services (summary)

| Need | Service |
|------|---------|
| Database | MongoDB Atlas |
| Photos / PDFs | Cloudinary (`find-near-doctor/dev/doctors/{phone}/`) |
| Doctor OTP SMS | MSG91 |
| Hosting | Netlify |

MongoDB stores metadata and file **URLs only** — never binary uploads.

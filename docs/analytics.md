# Analytics & traffic tracking

How public patient traffic is recorded in MongoDB for future dashboards and growth metrics.

---

## Goals

- Track **public** usage: home, search, doctor profiles
- Store **user agent**, **device type**, **path**, **referrer**, **session** (anonymous)
- **Exclude** `/admin` and `/doctor` routes (internal flows)
- **Privacy:** no raw IP stored — only a salted hash prefix for rough unique-visitor counts
- **Retention:** raw events auto-delete after **90 days** (TTL index) to protect Atlas free tier

---

## Collections

### `analytics_events` (active)

One document per tracked event.

```typescript
{
  id: string,
  type: "page_view" | "search" | "doctor_profile_view",
  path: string,              // e.g. /, /search, /doctors/dr-abc
  query?: string,            // e.g. pincode=700091
  sessionId: string,         // anonymous cookie fnd_sid (30 days)
  userAgent: string,
  device: "mobile" | "tablet" | "desktop" | "bot" | "unknown",
  referrer?: string,
  doctorId?: string,         // set on profile views
  ipHash?: string,           // SHA-256 prefix, not reversible
  country?: string,          // from Netlify/CF header when available
  metadata?: Record<string, string | number | boolean>,
  createdAt: Date            // TTL: expires after 90 days
}
```

**Indexes:**
- `createdAt` — TTL 90 days
- `type + createdAt`
- `path + createdAt`
- `sessionId + createdAt`

### `analytics_daily` (planned)

Pre-aggregated rollups for fast admin charts — populated by a future cron job.

```typescript
{
  date: "2026-08-03",        // UTC day, unique
  pageViews: number,
  uniqueSessions: number,
  topPaths: [{ path, count }],
  devices: [{ device, count }],
  updatedAt: string
}
```

---

## How tracking works

```
Patient opens page (/, /search, /doctors/[id])
        │
        ▼
PageViewTracker (client, root layout)
        │
        ▼
POST /api/analytics/event
        │
        ├── Sets/reads cookie fnd_sid (anonymous session)
        ├── Reads User-Agent, Referer, country headers
        └── Inserts into analytics_events
```

| Route | Event type |
|-------|------------|
| `/` | `page_view` |
| `/search` | `search` |
| `/doctors/[id]` | `doctor_profile_view` + `doctorId` |

**Not tracked:** `/admin/*`, `/doctor/*`, `/api/*`

---

## API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/analytics/event` | Public (cookie) | Record one event |
| GET | `/api/admin/analytics/summary?days=7` | Admin | Page views, sessions, top paths, devices |

### Example: admin summary

```bash
GET /api/admin/analytics/summary?days=7
```

```json
{
  "ok": true,
  "days": 7,
  "totalPageViews": 842,
  "uniqueSessions": 316,
  "topPaths": [
    { "path": "/", "count": 410 },
    { "path": "/search", "count": 280 }
  ],
  "devices": [
    { "device": "mobile", "count": 620 },
    { "device": "desktop", "count": 190 }
  ]
}
```

---

## Future work (Phase 2)

- [ ] Admin UI chart on `/admin/analytics`
- [ ] Nightly job: roll up `analytics_events` → `analytics_daily`, then rely less on raw scans
- [ ] Search filters in `metadata` (pincode, specialization)
- [ ] PWA install / offline events
- [ ] Optional: Plausible or PostHog alongside MongoDB for richer funnels

---

## Privacy notes

- No patient login required — sessions are anonymous UUIDs
- Raw IP never stored; `ipHash` uses `JWT_SECRET` as salt
- User agent stored for device/browser breakdown (standard for web analytics)
- Align with India DPDP when scaling — add cookie notice if required

---

## Setup

Indexes are created with:

```bash
cd apps/web && npm run db:setup
```

Tracking is **on by default** when MongoDB is configured. No extra env vars required.

---

## Related docs

- [database-schema.md](./database-schema.md)
- [api-database-plan.md](./api-database-plan.md)

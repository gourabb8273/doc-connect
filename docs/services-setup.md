# External services setup

Services used by **Find Near Doctor** and how to configure them.

---

## Active services (Phase 1)

| Need | Service | What it does | Status |
|------|---------|--------------|--------|
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Doctors, admins, OTPs, verification audit | Active |
| **File storage** | [Cloudinary](https://cloudinary.com) | Doctor photos, registration PDFs, certs, clinic images | Active |
| **SMS / OTP** | [MSG91](https://msg91.com) | Doctor login OTP (India) | Auth key set — needs template ID |
| **Hosting** | [Netlify](https://netlify.com) | Next.js PWA deployment | Active |

MongoDB stores **URLs only** for uploads — never binary files.

---

## Budget estimates (after free tier)

Rough monthly costs for a small launch (~20–50 doctors, ~500 patient visits/mo). Prices change — check each provider’s site before scaling.

| Service | Free tier | When you outgrow free | Phase 1 estimate | Notes |
|---------|-----------|------------------------|------------------|-------|
| **MongoDB Atlas** | M0 — 512 MB | M10 ~ **$57/mo** (~₹4,800) | **₹0** on M0 | Upgrade when DB > 400 MB or you need backups |
| **Cloudinary** | ~25 credits/mo | Plus ~ **$89/mo** or pay-as-you-go | **₹0–500/mo** | ~1 credit per upload/transform; 50 doctor onboardings ≈ within free |
| **MSG91** | Trial wallet on signup | ~ **₹0.15–0.25/SMS** | **₹15–50/mo** | 100 OTP logins ≈ ₹15–25; 500 ≈ ₹75–125 |
| **Netlify** | 100 GB bandwidth, hobby | Pro **$19/mo** (~₹1,600) | **₹0** | Free tier fine until traffic spikes |

### Example monthly budgets

| Stage | Doctors | OTP logins/mo | Est. monthly cost |
|-------|---------|---------------|-------------------|
| **Dev / seed** | 10–20 | 50 (testing) | **₹0** (all free tiers + dev OTP) |
| **Soft launch** | 50 | 200 | **₹30–50** (mostly MSG91 SMS) |
| **Early growth** | 200 | 800 | **₹120–200** SMS + maybe Cloudinary overage |
| **Production scale** | 1,000+ | 3,000+ | **₹500–1,500+** — consider Atlas M10, Netlify Pro |

**Rule of thumb:** SMS is the only recurring per-use cost in Phase 1. Database and hosting stay free until you have real traffic.

---

## Cloudinary (file storage — **in use**)

**Used for:** doctor photos, registration PDFs, degree certs, govt ID, clinic cover images.

### Env vars (`apps/web/.env.local` or Netlify)

```bash
UPLOAD_DEV_MODE=false
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Files upload to folder `find-near-doctor/dev/doctors/{phone}/` per doctor. MongoDB stores only the returned URL.

### Get keys

1. [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Dashboard → copy Cloud name, API Key, API Secret

### Cost after free

- **Free:** ~25 credits/month (enough for dev + ~50–100 uploads)
- **Paid:** Plus plan ~$89/mo or pay-per-credit (~$0.002–0.01 per operation)
- **Budget tip:** Compress images client-side; store PDFs as-is; delete test uploads from dashboard

---

## MSG91 (SMS OTP — **auth key configured**)

**Used for:** sending OTP SMS to doctor phones at login (India numbers).

**Auth key:** configured in `.env.local` as `MSG91_AUTH_KEY` (key name in dashboard: `otpkey`).

**Mode:** Managed OTP API (`POST /api/v5/otp`) — MSG91 generates and sends the code when `SMS_DEV_MODE=false`.

### Fix error 418 — “IP is not whitelisted”

If MSG91 logs show **418** with message **IP is not whitelisted**, OTP is being created but **delivery is blocked**. Your server’s public IP must be allowed on the auth key.

**Your current dev IP (from logs):** `45.250.50.105`

1. Log in to [MSG91 dashboard](https://control.msg91.com/)
2. Open **API** → **Auth Keys** (or profile menu → **Authkey**)
3. Find key **`otpkey`** → **Actions** (arrow) → **IP Security**
4. Either:
   - **Whitelist IP:** add `45.250.50.105` under **Whitelisted IPs** (use **Recent IPs** → **+** if shown), **or**
   - **Disable IP security** for this key (toggle off) — required for Netlify/serverless unless you use fixed egress IPs
5. Save and retry **Send OTP** on `/doctor/login`

MSG91 sends an alert email/SMS when 418 occurs. After whitelisting, SMS should deliver within seconds.

### Fix: API success but SMS not received (India)

MSG91 can return **success** while telecom operators **block delivery**. Your server logs show:

`no template_id — SMS may not deliver in India without DLT template + wallet balance`

**Required for India:**

1. **DLT registration** (one-time on your telecom DLT portal — Jio/Airtel/VI etc.)
   - Entity (PE) ID
   - Sender ID / Header (e.g. `FNDDOC`)
   - OTP content template approved (use `{#var#}` for OTP on DLT; `##OTP##` in MSG91)
2. **MSG91 OTP template** — Dashboard → **OTP** → **Templates** → **Add template**
   - Map DLT Template ID, Sender ID, body with `##OTP##`
   - Copy **Template ID** → `.env.local`:

```bash
MSG91_TEMPLATE_ID=your_template_id_from_msg91
```

3. **Wallet balance** — Dashboard → **Wallet** → top up if zero
4. **Delivery logs** — Dashboard → **Logs** → open latest row → check failure reason (e.g. *Template Id Missing*, *Template not matched*, *Insufficient balance*)

Restart dev server after adding `MSG91_TEMPLATE_ID`.

**Continue building without SMS:** set `SMS_DEV_MODE=true` → OTP is always **`123456`** (no SMS sent).

### Env vars

```bash
SMS_DEV_MODE=false             # true = always use OTP 123456 (dev)
MSG91_AUTH_KEY=                # Dashboard → API → Auth Keys
MSG91_TEMPLATE_ID=             # Dashboard → OTP → Templates
```

### Cost after free

- **Trial:** wallet credits on signup (varies — check MSG91 dashboard balance)
- **Paid:** ~ **₹0.15–0.25 per OTP SMS** (transactional, India)
- **Budget examples:**
  - 100 doctor logins/month → **~₹15–25**
  - 500 logins/month → **~₹75–125**
  - 2,000 logins/month → **~₹300–500**
- **DLT:** sender ID + template registration required for production (one-time setup in India)

### Alternative SMS providers

| Service | Free/trial | Paid (India OTP) |
|---------|------------|------------------|
| **MSG91** | Trial wallet | ~₹0.15–0.25/SMS |
| **Twilio** | ~$15 trial | ~$0.05–0.08/SMS |
| **Fast2SMS** | Small free tier | ~₹0.11–0.20/SMS |

---

## MongoDB Atlas (database — **in use**)

**Used for:** `doctors`, `admins`, `otps`, `verification_audit` collections.

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=find-near-doctor-dev
```

### Cost after free

- **M0 (free):** 512 MB storage, shared — fine for dev + ~1,000 doctor profiles (URLs only, no files)
- **M10:** ~ **$57/month** — dedicated, backups, better performance
- **Budget tip:** stay on M0 until backups or >400 MB storage needed

---

## Netlify (hosting — **in use**)

**Used for:** Next.js PWA at find-near-doctor.netlify.app

Add all env vars in **Site settings → Environment variables** (same as `.env.local`).

### Cost after free

- **Free:** 100 GB bandwidth, 300 build minutes/mo
- **Pro:** **$19/mo** — more bandwidth, team features, form handling
- **Budget tip:** free tier is enough for Phase 1 launch

---

## Quick reference — all env vars

```bash
# Database
MONGODB_URI=...
MONGODB_DB_NAME=find-near-doctor-dev

# Auth
JWT_SECRET=long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password

# SMS — MSG91
SMS_DEV_MODE=true              # false when template ID is set
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# Files — Cloudinary
UPLOAD_DEV_MODE=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Test checklist

1. **Doctor OTP (dev):** `/doctor/login` → phone → real SMS when `SMS_DEV_MODE=false` and IP whitelisted in MSG91
2. **Doctor OTP (fallback dev):** `SMS_DEV_MODE=true` → OTP **`123456`** (no SMS)
3. **If SMS fails with 418:** whitelist server IP in MSG91 Auth Keys (see above)
3. **Onboarding:** upload photo + cert → submit → MongoDB `doctors` (`status: pending`)
4. **Admin login:** `/admin/login` → credentials from env
5. **Approve:** `/admin/verifications` → Approve → doctor appears on home page

```bash
cd apps/web
npm run db:setup
npm run dev
```

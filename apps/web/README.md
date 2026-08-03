# Find Near Doctor — Web App

Next.js PWA for patient search, doctor onboarding, and admin verification.

## External services

| Service | Purpose | Docs |
|---------|---------|------|
| **MongoDB Atlas** | Doctors, admins, OTPs, audit trail | [database-schema.md](../../docs/database-schema.md) |
| **Cloudinary** | Photos, PDFs, certs (URLs stored in MongoDB) | [services-setup.md](../../docs/services-setup.md) |
| **MSG91** | Doctor login OTP SMS (dev: OTP `123456` until template set) | [services-setup.md](../../docs/services-setup.md) |
| **Netlify** | Production hosting | [netlify.toml](../../netlify.toml) |

Full stack reference: [docs/tech-stack.md](../../docs/tech-stack.md)

## Getting started

```bash
cp env.example .env.local   # fill in MongoDB + Cloudinary + JWT
npm install
npm run db:setup            # seed doctors + admin
npm run dev
```

- Patient search: [http://localhost:3000](http://localhost:3000)
- Doctor login: `/doctor/login` → OTP `123456` when `SMS_DEV_MODE=true`
- Admin login: `/admin/login` → credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD`

## Env vars

See `env.example`. Never commit `.env.local`.

For Netlify production, add the same variables in **Site settings → Environment variables**.

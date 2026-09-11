# My World City

A property marketplace for Jaipur — buy, build, manage and invest. Next.js 15 (App
Router) frontend + API routes, MongoDB (Mongoose), phone-OTP auth, Cloudinary image
uploads and Razorpay payments. Designed to deploy on Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in MONGODB_URI + SESSION_SECRET (others optional)
npm run dev                     # http://localhost:3000
```

The app runs without any third-party keys — features degrade gracefully:

| Missing config | Behaviour |
| --- | --- |
| `MONGODB_URI` | Pages render with static fallback content; auth/save/leads need the DB |
| `SMS_PROVIDER` | OTP is printed to the **server console** instead of sent by SMS |
| Cloudinary keys | Uploads return an Unsplash placeholder image |
| Razorpay keys | "Promote" settles instantly in dev mode (no real charge) |

## Required env

- `MONGODB_URI` — MongoDB Atlas connection string
- `SESSION_SECRET` — 32+ char random string (`openssl rand -base64 32`)

See [.env.example](.env.example) for the full list (SMS, Cloudinary, Razorpay, admin).

## SMS gateway (OTP login / signup)

Set `SMS_PROVIDER` to one of `msg91`, `fast2sms` or `twilio` and add that provider's keys:

| Provider | Variables | Notes |
| --- | --- | --- |
| `msg91` | `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `MSG91_SENDER_ID` (optional) | Recommended for India. Template must be DLT-approved and contain `##OTP##`. |
| `fast2sms` | `FAST2SMS_API_KEY` | Uses the OTP route. |
| `twilio` | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` | International; `TWILIO_FROM` is your Twilio number in E.164. |

Restart the server after changing these. Admins can check the configuration with
`GET /api/admin/sms` and send themselves a test code with `POST /api/admin/sms { "phone": "98xxxxxxxx" }`.
With `SMS_PROVIDER` blank, codes are printed to the server log (and shown on screen in `npm run dev`).

## Seeding demo data

Seed sample properties + experts from `data.js`:

1. Set `SEED_SECRET` in `.env.local`, then:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed -H "x-seed-secret: <your-secret>"
   ```
2. Or log in with a phone listed in `ADMIN_PHONES` (auto-granted admin) and POST the
   same endpoint from the browser.

## Becoming an admin

Add your 10-digit number to `ADMIN_PHONES` (comma-separated). On your next OTP login
you'll get the `admin` role and the **Admin** console at `/admin`.

## Architecture

```
app/
  api/            Route handlers (the backend)
    auth/         OTP send/verify, logout, me
    properties/   list + CRUD
    saved/        save / unsave
    leads/        public lead capture
    me/           dashboard data (my listings, my leads)
    payments/     Razorpay create-order + verify
    upload/       Cloudinary signed upload
    admin/        moderation + seed
  (pages)         home, find-property, property/[slug], experts, services,
                  develop, saved, dashboard, admin, list-property
lib/
  db.js           cached Mongoose connection
  models/         User, Otp, Property, SavedProperty, Lead, Expert, Payment
  auth/           session (jose JWT) + otp helpers
  api.js          handler wrapper, auth guards, validation helpers
  validation.js   Zod schemas
components/        UI (auth, listing, property, experts, services, dashboard, …)
```

## Key flows

- **Auth** — phone → OTP → JWT in an httpOnly cookie (`mwc_session`)
- **Listings** — `/find-property` filters/sorts via `GET /api/properties`; details at `/property/[slug]`
- **List a property** — `/list-property` 4-step wizard → image upload → `pending` listing → admin approval → `active`
- **Saved** — optimistic heart toggle, persisted per user
- **Leads** — enquiry / visit / callback / service / expert forms → `POST /api/leads`
- **Dashboard** — your listings (+ promote) and leads
- **Admin** — approve/reject/verify/feature listings, manage leads

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add all env vars from `.env.example` in Vercel → Project → Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Deploy. Run the seed endpoint once against the production URL.

## Scripts

- `npm run dev` — develop
- `npm run build` — production build
- `npm start` — run the production build
- `npm run lint` — lint

# My World City

A property marketplace for Jaipur — buy, build, manage and invest. Next.js 15 (App
Router) frontend + API routes, MongoDB (Mongoose), email-OTP auth, Cloudinary image
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
| SMTP settings | The login code is printed to the **server console** instead of emailed |
| Cloudinary keys | Uploads return an Unsplash placeholder image |
| Razorpay keys | "Promote" settles instantly in dev mode (no real charge) |

## Required env

- `MONGODB_URI` — MongoDB Atlas connection string
- `SESSION_SECRET` — 32+ char random string (`openssl rand -base64 32`)

See [.env.example](.env.example) for the full list (SMTP, Cloudinary, Razorpay, admin).

## Authentication

Accounts are identified by **email address**. There is no password for ordinary
users: they type their email, we send a 6-digit code, they type it back. The same
form handles sign-up and sign-in — an address we already know simply signs in.

A phone number is still collected on the listing wizard and enquiry forms, but
only as a contact detail. It is never used to log in.

Owners issued a temporary password when a listing was filed can still sign in
with email + password from the "Owner with a password?" link on `/login`.

## Email (login codes)

Codes go out over SMTP. Fill these in and restart:

| Variable | Meaning |
| --- | --- |
| `SMTP_HOST` | Mail server hostname, e.g. `smtp.mailercloud.com` |
| `SMTP_PORT` | `587` for STARTTLS (the default) |
| `SMTP_USER` | SMTP username from the mail provider |
| `SMTP_PASSWORD` | SMTP password / API key |
| `MAIL_FROM` | The "from" address, on a domain verified with the provider |

Admins can check the set-up with `GET /api/admin/email` and send themselves a
test code with `POST /api/admin/email { "to": "you@example.com" }`.

With these blank, codes are printed to the server log (and shown on screen in
`npm run dev`) so the flow still works before the mail account exists.

## Seeding demo data

Seed sample properties + experts from `data.js`:

1. Set `SEED_SECRET` in `.env.local`, then:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed -H "x-seed-secret: <your-secret>"
   ```
2. Or log in with an email listed in `ADMIN_EMAILS` (auto-granted admin) and POST the
   same endpoint from the browser.

## Becoming an admin

Add your email to `ADMIN_EMAILS` (comma-separated). On your next login you'll get
the `admin` role and the **Admin** console at `/admin`.

The console has its own sign-in at `/admin/login` — **email + password**, no
emailed code. Set or reset an admin's password with:

```bash
node set-admin-password.cjs you@example.com "<password>"
node set-admin-password.cjs --all-admins "<password>"
```

## Migrating an existing database

Accounts used to be keyed by phone. Run this once after deploying the email change:

```bash
node migrate-email-auth.cjs            # report only
node migrate-email-auth.cjs --apply    # rebuild indexes, clear stale codes
```

It rebuilds the unique indexes as sparse (the old phone index rejects the second
account created without a number) and lists any account that has no email address
— those people cannot log in until one is added.

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

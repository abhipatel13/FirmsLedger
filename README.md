# FirmsLedger

India's trusted platform to discover and connect with verified business service providers and staffing agencies.

## Tech stack

- **Next.js 15** (App Router)
- **React 18**, **Tailwind CSS**
- **TanStack Query** for data fetching
- Local API client (see `src/api/apiClient.js`) — replace with your own backend when ready

## Getting started

1. Clone the repo and go to the project directory.
2. Install dependencies: `npm install`
3. Run the app: `npm run dev` (development) or `npm run build` then `npm run start` (production)

No environment variables are required. The app uses in-memory mock data by default.

### Using Supabase as the database

1. Create a project at [supabase.com](https://supabase.com) and get your project URL and anon key (Settings → API).
2. In `.env.local` add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. In the Supabase **SQL Editor**, run the schema: copy the contents of `supabase/schema.sql` and run it. That creates tables: `categories`, `agencies`, `agency_categories`, `reviews`, `leads`, `company_invites`.
4. **Insert data:** In Supabase **SQL Editor**, run `supabase/seed-data.sql` to insert categories (and optionally uncomment the agencies block to add sample agencies). You can also add or edit rows in **Table Editor** (e.g. set `approved = true` on an agency to show it on the site).
5. Restart the dev server. The app will use Supabase for all data; companies can submit listings and you approve them in the Supabase Dashboard (set `approved = true` on an agency to show it on the site).

### Inviting companies and collecting their data

- **Send email invite:** Go to **Invite agency** (footer or `/InviteAgency`). Enter the agency email (and optional company name), click Send. They get an email with a link; when they submit the form, data is saved in Supabase. Add `RESEND_API_KEY` from [resend.com](https://resend.com) to `.env.local` to send emails.
- **Public form:** Anyone can go to **List your company** (header “Get Listed” or footer link, or `/ListYourCompany`) and submit their business. New rows go into `agencies` with `approved = false` until you approve them in Supabase.
- **Invite link:** You can invite specific companies by sending them a link with a token:
  1. In Supabase, insert a row into `company_invites` with: `token` (e.g. a random string), `email` (their email), optional `company_name`, and `expires_at` (e.g. `now() + interval '14 days'`).
  2. Send them: `https://your-site.com/join?token=THE_TOKEN`.
  3. They open the link, see a pre-filled "List your company" form, submit it, and the invite is marked used and linked to the new agency.

### Admin panel – email agencies that registered

Go to **Admin** (footer link or `/admin`). You’ll see all agencies that registered on your platform. For each agency with an email, use **Send email** to open a composer (subject + message) and send them an email via Resend.

- **Required:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (Supabase → Settings → API → `service_role` key) so the admin can list all agencies.
- **Required for sending:** `RESEND_API_KEY` in `.env.local` (see Resend above).
- **Admin login:** Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` to sign in at `/admin`. If the password contains `$` or spaces, wrap it in double quotes, e.g. `ADMIN_PASSWORD="Abhi1234$1"`. Restart the dev server after changing `.env.local`.

**Quick admin check:** 1) Open `/admin`. 2) Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. 3) You should see the agency list (requires `SUPABASE_SERVICE_ROLE_KEY`). 4) Use **Send email** on a row with an email (requires `RESEND_API_KEY`). 5) **Log out** — footer “Invite agency” and “Admin” links disappear until you log in again.

## Project structure

- `app/` — Next.js App Router pages and layout
- `src/views/` — Page-level components (Home, Directory, AgencyProfile, etc.)
- `src/components/` — Reusable UI components
- `src/api/apiClient.js` — Data and auth API; swap this for your backend
- `src/lib/` — Auth context, app params, utilities

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Run production server
- `npm run lint` — Run ESLint

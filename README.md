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

No environment variables are required. The app uses in-memory mock data by default. To use a real backend, replace the implementation in `src/api/apiClient.js` with your REST/GraphQL client.

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

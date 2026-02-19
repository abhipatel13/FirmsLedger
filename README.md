**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

This project uses **Next.js** (App Router). UI and functionality match the original app.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
NEXT_PUBLIC_BASE44_APP_ID=your_app_id
NEXT_PUBLIC_BASE44_APP_BASE_URL=your_backend_url
NEXT_PUBLIC_BASE44_FUNCTIONS_VERSION=optional

e.g.
NEXT_PUBLIC_BASE44_APP_ID=cbef744a8545c389ef439ea6
NEXT_PUBLIC_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev` (development) or `npm run build` then `npm run start` (production)

**Seed data from CSV exports**

To load the data from `Category_export.csv`, `Agency_export.csv`, `AgencyCategory_export.csv`, `Review_export.csv`, and `Lead_export.csv` into your Base44 app:

1. Ensure `.env.local` has `NEXT_PUBLIC_BASE44_APP_ID` and `NEXT_PUBLIC_BASE44_APP_BASE_URL` (and optionally `BASE44_ACCESS_TOKEN` for authenticated import).
2. Place the CSV files in the project root (same folder as `package.json`).
3. Run:
   ```bash
   npm run seed
   ```
   Or with Node 20+: `node --env-file=.env.local scripts/seed-base44.mjs`

The script creates Categories, then Agencies, then AgencyCategory links, then Reviews, then Leads. If your Base44 backend does not allow setting `id` on create, you may need to remove the `id` field from the payload in `scripts/seed-base44.mjs` or use the import feature in the Base44 dashboard instead.

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)

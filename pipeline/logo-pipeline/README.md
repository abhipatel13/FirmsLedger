# Logo Pipeline — offline company logo discovery/download

Builds a local `results.csv` mapping company id → discovered logo. Phases A, B, C
make **zero Neon queries** — this directory has no Neon imports by design. The only
network calls are (a) one fetch per unique company homepage, and (b) fetching the
chosen logo image from that same domain (plus one bounded DuckDuckGo fallback per
domain when nothing else works).

## Cost constraints (non-negotiable)

- **No `SELECT * FROM companies`, no full-table scans, no N+1.** Company data comes
  from the local CSV snapshots (`companies_2026-07-31.csv`, `pending/approved-2026-07-31.csv`).
- **`--limit` is always bounded** — defaults to `300`, never "no limit". Re-running
  resumes via `state.jsonl`, so already-processed companies are never re-fetched.
- **`--concurrency` is capped at 5.** Higher concurrency risks rate limits on target
  small-business sites and buys nothing (this phase makes no Neon queries).
- **Homepage fetches are capped at 2MB, logo image fetches at 3MB**, both with 10s
  timeouts and ≤5 redirects.
- **R2 uploads default to dry-run** until real R2 credentials exist in the
  environment. A run without `--dry-run` still dry-runs if `R2_ACCOUNT_ID` /
  `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` / `R2_PUBLIC_URL`
  are not all present.

## Locked decisions (D1–D3)

- **D1** — images are normalized to **256×256 WebP** via `sharp`
  (`fit: 'contain'` on a transparent canvas, matching the profile page's
  `object-contain`). Keys are deterministic `logos/{id}.webp`.
- **D2** — scope is **approved companies only** (rows in `pending/approved-2026-07-31.csv`).
- **D3** — default batch is `--limit 300 --concurrency 5`.

## Usage

```bash
# 1. Build input.csv (local CSV join, no network, no Neon)
node pipeline/logo-pipeline/prepare-input.cjs

# 2. Sanity-check a tiny batch first
node pipeline/logo-pipeline/index.cjs --dry-run --limit 10

# 3. Then run real batches
node pipeline/logo-pipeline/index.cjs --limit 300 --concurrency 5 --resume

# Retry only transient failures (not not_found rows)
node pipeline/logo-pipeline/index.cjs --retry-failed --limit 100

# Point at a different input file
node pipeline/logo-pipeline/index.cjs --from input.csv
```

## Flags

| Flag            | Meaning                                                            |
| --------------- | ------------------------------------------------------------------ |
| `--limit N`     | Max companies processed this run (default `300`). Never unbounded. |
| `--concurrency` | Parallel workers (default `5`, capped at `5`).                     |
| `--dry-run`     | Discover + download + normalize only — no R2 write.                |
| `--retry-failed`| Re-attempt rows with `failed` status only (not `not_found`).       |
| `--resume`      | Accepted for clarity; resume is always on. Terminal rows are always skipped unless `--retry-failed`. |
| `--from PATH`   | Input CSV path (default `pipeline/logo-pipeline/input.csv`).        |

## Output files (generated, gitignored)

- `input.csv` — joined approved companies (`id,slug,name,website`).
- `unprocessable.csv` — rows that couldn't be joined, with a `reason`.
- `state.jsonl` — append-only resume log, one JSON line per company
  (`{ id, slug, domain, status, source, r2_url, error, processed_at }`).
  Terminal statuses: `found`, `not_found`, `failed`; dry-run success is `would_upload`.
- `results.csv` — `id,slug,status,source,r2_url,error`. This is the single contract a
  later Phase D import would read.
- `html_cache/` — per-domain homepage HTML (`{domain}.html`) plus a `{domain}.meta.json`
  sidecar recording the post-redirect final URL (needed to resolve relative logo URLs).

## Status semantics

- `found` / `would_upload` — a logo was obtained (or would be uploaded in dry-run).
- `not_found` — clean miss: the site was reachable but no logo was discovered and the
  DuckDuckGo fallback failed. Retrying won't help.
- `failed` — transient error (network/timeout/5xx/429/upload failure). Safe to retry.

## Safety notes

- Do not raise `--concurrency` above 5 or run without a limit.
- `--retry-failed` re-fetches only `failed` rows to avoid wasting bandwidth on clean misses.
- Phase D (writing `results.csv` back to Neon) is intentionally **not** built here —
  see `LOGO_PIPELINE_PLAN.md`.

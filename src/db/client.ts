import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const rawSql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : (null as any);

// Opt-in SQL round-trip counter. Off unless NEON_LOG_QUERIES=1, so production
// pays nothing for it and takes the raw client path untouched. Used by
// scripts/count-queries.mjs to prove that a warm cache render performs zero
// database touches — see
// docs/superpowers/plans/2026-08-19-neon-compute-cost-reduction.md
let queryCount = 0;
export const dbQueryCount = () => queryCount;
export const resetDbQueryCount = () => {
  queryCount = 0;
};

const bump = (label: string) => {
  queryCount += 1;
  console.log(`[neon] query #${queryCount} (${label})`);
};

// drizzle's neon-http session picks `client.query ?? client` (see
// node_modules/drizzle-orm/neon-http/session.js), so wrapping only the callable
// is not enough — Object.assign would copy the unwrapped .query straight over
// the counter and it would never fire. Wrap .query and .transaction too.
const counting =
  rawSql && process.env.NEON_LOG_QUERIES === '1'
    ? Object.assign(
        (...args: any[]) => {
          bump('tagged');
          return (rawSql as any)(...args);
        },
        rawSql,
        {
          query: (...args: any[]) => {
            bump('query');
            return (rawSql as any).query(...args);
          },
          transaction: (...args: any[]) => {
            bump('transaction');
            return (rawSql as any).transaction(...args);
          },
        }
      )
    : rawSql;

const sql = counting;
export const db = process.env.DATABASE_URL ? drizzle(sql, { schema }) : (null as any);

export type DB = typeof db;

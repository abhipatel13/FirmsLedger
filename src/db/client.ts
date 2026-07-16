import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : (null as any);
export const db = process.env.DATABASE_URL ? drizzle(sql, { schema }) : (null as any);

export type DB = typeof db;

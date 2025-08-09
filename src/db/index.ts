import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { neon, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

neonConfig.fetchConnectionCache = true;
neonConfig.wsProxy = (host) => `${host}:5432/v1`;
neonConfig.useSecureWebSocket = false;
neonConfig.poolQueryViaFetch = true;

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { 
    schema,
    logger: process.env.NODE_ENV === 'development'
});

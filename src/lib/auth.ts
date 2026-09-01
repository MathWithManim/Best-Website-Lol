import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema';

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL || '';

export const auth = betterAuth({
  database: drizzleAdapter(neon(databaseUrl) as any, {
    provider: 'pg',
    schema: {
      user: schema.authUser,
      session: schema.authSession,
      account: schema.authAccount,
      verification: schema.authVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'default-secret-change-in-production',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'https://nostalgiachillax.pages.dev',
    'https://*.nostalgiachillax.pages.dev',
    'http://localhost:3000',
  ],
});

export default auth;

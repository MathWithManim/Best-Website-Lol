import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

export const trustedAuthOrigins = (): string[] => [
  siteUrl,
  ...(process.env.AUTH_EXTRA_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.CONVEX_SITE_URL,
    trustedOrigins: trustedAuthOrigins(),
    rateLimit: {
      enabled: true,
      window: 60,
      max: 20,
    },
    database: authComponent.adapter(ctx),
    // Simple, non-verified email/password auth to get started
    emailAndPassword: {
      enabled: true,
      // Email verification requires a configured sendVerificationEmail (SMTP) provider.
      // Without one, signups get emailVerified:false and are hard-locked out — keep off until email is wired up.
      requireEmailVerification: false,
    },
    plugins: [
      // The cross domain plugin is required for client side frameworks
      crossDomain({ siteUrl }),
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  } satisfies BetterAuthOptions);
};
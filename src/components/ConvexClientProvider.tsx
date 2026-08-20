import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "../lib/auth-client";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "http://localhost:8080";
const convex = new ConvexReactClient(convexUrl, {
  // Pause queries until the auth token from Better Auth is validated
  expectAuth: true,
});

export default function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
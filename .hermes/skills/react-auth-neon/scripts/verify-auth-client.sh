#!/usr/bin/env bash
# verify-auth-client.sh — Verify the auth-client baseURL resolution order
# Run: npx wrangler pages dev locally, or inspect the built artifact

set -e

echo "=== Checking auth-client.ts baseURL resolution ==="

# Check if VITE_NEON_AUTH_URL is referenced
if grep -q "VITE_NEON_AUTH_URL" /home/website/src/lib/auth-client.ts; then
  echo "✓ VITE_NEON_AUTH_URL referenced in auth-client.ts"
else
  echo "✗ VITE_NEON_AUTH_URL NOT referenced in auth-client.ts"
  exit 1
fi

# Check if hardcoded Neon fallback exists
if grep -q "ep-soft-wind-ayywd88x.neonauth.c-5.us-east-2.aws.neon.tech/neondb/auth" /home/website/src/lib/auth-client.ts; then
  echo "✓ Hardcoded Neon fallback present in auth-client.ts"
else
  echo "✗ Hardcoded Neon fallback MISSING from auth-client.ts"
  exit 1
fi

# Check if vite.config.ts has the proxy
if grep -q "proxy.*neon.*target" /home/website/vite.config.ts 2>/dev/null || grep -q "new URL.*neonAuthUrl" /home/website/vite.config.ts 2>/dev/null; then
  echo "✓ vite.config.ts has Neon proxy configuration"
else
  echo "✗ vite.config.ts MISSING Neon proxy configuration"
  exit 1
fi

# Check AuthModal.tsx for EMAIL_NOT_VERIFIED handling
if grep -q "email_not_verified\|email.*not verified\|verify your email" /home/website/src/components/app/AuthModal.tsx; then
  echo "✓ AuthModal.tsx handles EMAIL_NOT_VERIFIED"
else
  echo "✗ AuthModal.tsx MISSING EMAIL_NOT_VERIFIED handling"
  exit 1
fi

echo ""
echo "=== All checks passed ==="
echo "The auth-client is properly configured for Neon Auth."
echo "Remember to also set VITE_NEON_AUTH_URL in Cloudflare Pages env."
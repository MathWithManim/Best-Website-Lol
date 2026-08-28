import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // No Convex proxy needed for Neon migration.
  // Better Auth / Neon uses same-origin or NEON_AUTH_URL, not Convex site proxy.
})

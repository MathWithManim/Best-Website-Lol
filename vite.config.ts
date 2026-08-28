import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Neon Auth base — may already include /auth or /api/auth suffix; we need origin
  const neonAuthUrl = env.VITE_NEON_AUTH_URL || env.NEON_AUTH_URL || ''
  let proxyTarget = ''
  try {
    if (neonAuthUrl) proxyTarget = new URL(neonAuthUrl).origin
  } catch { proxyTarget = '' }

  return {
    plugins: [react()],
    server: proxyTarget
      ? {
          proxy: {
            '/api/auth': {
              target: proxyTarget,
              changeOrigin: true,
              secure: true,
            },
          },
        }
      : undefined,
  }
})

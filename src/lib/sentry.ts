let capture: ((error: unknown) => void) | null = null;

export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({ dsn });
    capture = (error: unknown) => Sentry.captureException(error);
  } catch {
    /* never let telemetry break the app */
  }
}

export function captureError(error: unknown) {
  capture?.(error);
}

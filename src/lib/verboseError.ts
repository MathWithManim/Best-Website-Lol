export function verboseError(ctx: string, err: unknown, meta?: Record<string, unknown>) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  const payload = { context: ctx, message, stack, timestamp: new Date().toISOString(), ...meta };
  console.error('[VERBOSE]', JSON.stringify(payload));
  throw new Error(`[${ctx}] ${message}`);
}

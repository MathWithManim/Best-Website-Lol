// Stub for convex/_generated/api - makes tsc happy during Drizzle migration
export const api: any = new Proxy({}, {
  get(_t, mod: string) {
    return new Proxy({}, {
      get(_t2, fn: string) {
        return `${mod}.${fn}`;
      }
    });
  }
});

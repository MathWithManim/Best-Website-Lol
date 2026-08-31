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
export const useQuery = () => ({ data: null, isLoading: false, error: null }) as any;
export const useMutation = () => (() => Promise.resolve()) as any;
export const ConvexReactClient = () => ({}) as any;
export const ConvexProvider = ({ children }: { children: any }) => children;

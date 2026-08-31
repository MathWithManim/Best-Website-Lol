export const api: any = new Proxy({}, {
  get(_t, mod: string) {
    return new Proxy({}, {
      get(_t2, fn: string) {
        return `${mod}.${fn}`;
      }
    });
  }
});
export const useQuery = (...args: any[]): any => ({ data: null, isLoading: false, error: null }) as any;
export const useMutation = (...args: any[]): any => ((...margs: any[]) => Promise.resolve({})) as any;
export interface ConvexReactClientType { query: (...args: any[]) => Promise<any>; mutation: (...args: any[]) => Promise<any>; }
export const ConvexReactClient = function(this: any, url?: string): ConvexReactClientType {
  return { query: () => Promise.resolve({}), mutation: () => Promise.resolve({}) };
} as any;
export const ConvexProvider = ({ children, client }: { children: any; client?: any }) => children;

import { createContext, useContext, ReactNode } from 'react';
import { db } from '../db';

const DbContext = createContext(db);
export const useDb = () => useContext(DbContext);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

import { createContext, useContext } from 'react';

export interface User {
  email: string;
  username: string;
  name: string;
  bio: string;
  pfp: string;
  luckbucks: number;
  equippedCosmetic?: string;
  rebirthCount: number;
  rollCount: number;
  nextRollCost: number;
  distinctCaught: number;
  totalRarities: number;
  nextRebirthAt: number;
  completedGame: boolean;
}

export const UserContext = createContext<User | null | undefined>(undefined);

export const useUser = () => useContext(UserContext);
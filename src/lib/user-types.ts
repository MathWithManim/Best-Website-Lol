export interface User {
  _id: string | number;
  email: string;
  username?: string;
  rarityCounts?: string | Record<string, number>;
  luckbucks: number;
  rebirthCount: number;
  totalRarities: number;
  createdAt?: string;
}
export interface ProfileResult {
  username: string;
  email: string;
  rarityCounts: string;
  rebirthCount: number;
  totalRarities: number;
}

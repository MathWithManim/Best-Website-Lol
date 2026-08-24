export interface ArcadeGame {
  id: number;
  name: string;
  tagline: string;
  tooltip: string;
  color: string;
  dark: string;
}

export const GAMES: ArcadeGame[] = [
  {
    id: 1,
    name: 'Plinko',
    tagline: 'Drop it. Watch it bounce.',
    tooltip: 'Drop a ball through a wall of pegs and pray it finds a fat multiplier bucket.',
    color: '#0E7C7B',
    dark: '#0A5453',
  },
  {
    id: 2,
    name: 'Coin Flip',
    tagline: 'Heads or tails, no takebacks.',
    tooltip: 'Call it in the air. A full 3D flip decides whether you called it right.',
    color: '#C9962E',
    dark: '#8F6A1E',
  },
  {
    id: 3,
    name: 'Mini Slots',
    tagline: 'Three reels. One pull.',
    tooltip: 'Line up three matching symbols across the reels for the jackpot row.',
    color: '#C0392B',
    dark: '#8A281E',
  },
  {
    id: 4,
    name: 'Hi-Lo',
    tagline: 'Higher or lower?',
    tooltip: 'See one card, call the next one higher or lower. Streaks are the whole game.',
    color: '#2E7D32',
    dark: '#1F5722',
  },
  {
    id: 5,
    name: 'Wheel Spin',
    tagline: 'Round and round it goes.',
    tooltip: 'Give the prize wheel a spin and see where the pointer settles.',
    color: '#7048B6',
    dark: '#4E3180',
  },
];

export const getGame = (id: number | string | undefined): ArcadeGame | undefined =>
  GAMES.find((g) => g.id === Number(id));

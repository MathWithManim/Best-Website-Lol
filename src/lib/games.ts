export interface ArcadeGame {
  id: number;
  key: 'plinko' | 'coin' | 'hilo' | 'wheel';
  name: string;
  tagline: string;
  tooltip: string;
  color: string;
  dark: string;
  cost: number;
  rules: string[];
}

export const GAMES: ArcadeGame[] = [
  {
    id: 1,
    key: 'plinko',
    name: 'Plinko',
    tagline: 'Drop it. Watch it bounce.',
    tooltip: 'Drop a ball through a wall of pegs and pray it finds a fat multiplier bucket.',
    color: '#0E7C7B',
    dark: '#0A5453',
    cost: 10,
    rules: ['Costs 10 LuckBucks per drop.', 'Nine buckets: x10 · x1 · x0.5 · x2 · x0.2 · x2 · x0.5 · x1 · x10.', 'Middle buckets hit often, edges are the jackpot.'],
  },
  {
    id: 2,
    key: 'coin',
    name: 'Coin Flip',
    tagline: 'Heads or tails, no takebacks.',
    tooltip: 'Call it in the air. A full 3D flip decides whether you called it right.',
    color: '#C9962E',
    dark: '#8F6A1E',
    cost: 5,
    rules: ['Costs 5 LuckBucks per call.', 'Correct call pays 9 LB.', 'Wrong call loses the stake.'],
  },
  {
    id: 3,
    key: 'hilo',
    name: 'Hi-Lo',
    tagline: 'Higher or lower?',
    tooltip: 'See one card, call the next one higher or lower. Streaks are the whole game.',
    color: '#2E7D32',
    dark: '#1F5722',
    cost: 10,
    rules: ['Entry costs 10 LuckBucks.', 'Every correct guess pays +5 LB instantly and continues the run.', 'A wrong guess ends the run. Ties go to you. Ace is high.'],
  },
  {
    id: 4,
    key: 'wheel',
    name: 'Wheel Spin',
    tagline: 'Round and round it goes.',
    tooltip: 'Give the prize wheel a spin and see where the pointer settles.',
    color: '#7048B6',
    dark: '#4E3180',
    cost: 25,
    rules: ['Costs 25 LuckBucks per spin.', 'Segments: three blanks, x1 twice, x2, and a x5 JACKPOT wedge.', 'Payout = stake × multiplier, floored.'],
  },
];

export const getGame = (id: number | string | undefined): ArcadeGame | undefined =>
  GAMES.find((g) => g.id === Number(id));

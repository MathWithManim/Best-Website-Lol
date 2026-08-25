export interface ArcadeGame {
  id: number;
  key: 'plinko' | 'coin' | 'hilo' | 'wheel' | 'dice' | 'mines' | 'slots' | 'limbo' | 'cups';
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
    tagline: 'Higher or lower, once.',
    tooltip: 'See one card, call the next one higher or lower. Odds-based payout, one shot.',
    color: '#2E7D32',
    dark: '#1F5722',
    cost: 10,
    rules: ['Entry costs 10 LuckBucks.', 'One guess: the payout scales with the odds — safe calls pay little, brave calls pay up to x2.08.', 'Ties push your stake back. One guess, then the round is over.'],
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
    rules: ['Costs 25 LuckBucks per spin.', 'Segments: three blanks, x1 twice, x1.5, and a x5 JACKPOT wedge.', 'Payout = stake × multiplier, floored.'],
  },
  {
    id: 5,
    key: 'dice',
    name: 'Dice Roll',
    tagline: 'Slide your odds.',
    tooltip: 'Roll 1-100 against a target you choose. Tighter targets pay bigger multipliers.',
    color: '#C0392B',
    dark: '#7E241B',
    cost: 10,
    rules: ['Costs 10 LuckBucks per roll.', 'Pick a target 2-98 and bet over or under it.', 'Multiplier = 0.96 / win chance — a 50/50 pays x1.92, a 2% snipe pays up to x48.'],
  },
  {
    id: 6,
    key: 'mines',
    name: 'Mine Sweep',
    tagline: 'Three mines, nine tiles.',
    tooltip: 'Mark up to 4 tiles, then reveal. Dodge all three mines and the pot is yours.',
    color: '#34495E',
    dark: '#22303F',
    cost: 10,
    rules: ['Costs 10 LuckBucks per round.', 'Tap 1-4 tiles you think are safe, then reveal.', 'All safe pays x1.44 (1 tile) up to x8.06 (4 tiles). One mine ends it.'],
  },
  {
    id: 7,
    key: 'slots',
    name: 'Lucky Sevens',
    tagline: 'Three reels, one dream.',
    tooltip: 'Match symbols across the reels. Triples pay up to x50, any pair pays x1.5.',
    color: '#E67E22',
    dark: '#9C5514',
    cost: 5,
    rules: ['Costs 5 LuckBucks per spin.', 'Three of a kind pays x2.5 up to x50 (triple SEVEN).', 'Any two matching symbols pay x1.5.'],
  },
  {
    id: 8,
    key: 'limbo',
    name: 'Limbo',
    tagline: 'How low can you go?',
    tooltip: 'Name your multiplier, then hope the roll lands under it. Greed is the game.',
    color: '#2980B9',
    dark: '#1B5A80',
    cost: 10,
    rules: ['Costs 10 LuckBucks per round.', 'Pick a target multiplier from x1.10 to x50.', 'You win if the hidden roll lands under 96 / target. Bigger targets, smaller odds.'],
  },
  {
    id: 9,
    key: 'cups',
    name: 'Cups',
    tagline: 'Follow the ball.',
    tooltip: 'Three cups, one ball, one shuffle. Pick the right cup and triple-ish your stake.',
    color: '#7D6608',
    dark: '#524405',
    cost: 5,
    rules: ['Costs 5 LuckBucks per round.', 'The ball hides under one of three cups — pick one.', 'Correct pick pays x2.88. Wrong pick loses the stake.'],
  },
];

export const getGame = (id: number | string | undefined): ArcadeGame | undefined =>
  GAMES.find((g) => g.id === Number(id));

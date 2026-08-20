import { useEffect, useState } from 'react';
import { m } from 'framer-motion';

interface EndgameScreenProps {
  distinctCaught: number;
}

const MOCKING_LINES = [
  'You caught all 500. Either you are a bot, or you wasted your actual life on this.',
  'The square is spinning because it is doing more with its time than you did.',
  'A bot could have done this. A human who did this is worse than a bot.',
  'Congratulations. You have beaten the game. There was no reward. There never was.',
  'This is the part where the game roasts you. The square agrees.',
  'All those rolls. All those LuckBucks. And for what? A spinning square.',
  'You could have learned a language in the time this took. You chose the square.',
];

const EndgameScreen = ({ distinctCaught }: EndgameScreenProps) => {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % MOCKING_LINES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm mx-auto py-8">
      <div className="relative flex items-center justify-center h-40 md:h-52 w-full rounded-2xl border-4 border-red-500/40 bg-black/40 overflow-hidden">
        <m.div
          className="w-24 h-24 md:w-32 md:h-32 bg-red-500/80 rounded-lg"
          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
          transition={{ rotate: { repeat: Infinity, duration: 2.5, ease: 'linear' }, scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-7xl md:text-8xl font-bold select-none pointer-events-none">
          LOCKED
        </div>
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-red-500 dark:text-red-400">
          GAME COMPLETE
        </h2>
        <p className="text-sm font-mono text-white/80">
          {distinctCaught} / 500 rarities collected
        </p>
        <m.p
          key={lineIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm md:text-base font-mono text-amber-400 dark:text-amber-300 italic min-h-10"
        >
          &quot;{MOCKING_LINES[lineIndex]}&quot;
        </m.p>
      </div>

      <button
        disabled
        className="w-full py-4 px-8 bg-red-500/20 text-red-400 border border-red-500/40 font-mono text-lg font-bold rounded-xl cursor-not-allowed"
        title="The game is over. There is nothing to roll for."
      >
        Rolls Locked
      </button>
    </div>
  );
};

export default EndgameScreen;
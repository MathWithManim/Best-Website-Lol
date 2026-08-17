import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';

const RARITIES = [
  "Common", "Uncommon", "Rare", "Legendary", "Mythical", "Divine", "Prismatic", 
  "Transcendent", "Epic", "Unique", "Heroic", "Fabled", "Ancient", "Ethereal", 
  "Celestial", "Astral", "Galactic", "Infinite", "Void", "Chaos", "Order", 
  "Reality", "Existence", "Infinity", "Beyond", "Absolute", "Final", "Omega", 
  "Alpha", "Zenith"
];

const RNGGame = () => {
  const roll = useMutation(api.rng.roll);
  const [result, setResult] = useState<string | null>(null);
  const [rollingText, setRollingText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoll = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    const animationDuration = 2000;
    const email = localStorage.getItem('userEmail') || undefined;
    const rollPromise = roll({ email });

    const interval = setInterval(() => {
      const randomRarity = RARITIES[Math.floor(Math.random() * RARITIES.length)];
      setRollingText(randomRarity);
    }, 100);

    try {
      const [outcome] = await Promise.all([
        rollPromise,
        new Promise(resolve => setTimeout(resolve, animationDuration))
      ]);
      setResult(outcome as string);
    } catch (err: any) {
      setError(err.message || 'Roll failed');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setRollingText(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-secondary/5 rounded-lg w-full max-w-sm mx-auto border border-primary/20">
      <h3 className="font-mono text-xl md:text-2xl text-accent mb-4">Roll for Rarity</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-500/10 text-red-700 font-mono text-xs rounded text-center">
          {error}
        </div>
      )}

      <button 
        onClick={handleRoll}
        disabled={loading}
        className="px-6 py-3 bg-primary text-bg font-mono rounded hover:bg-darker transition-colors disabled:opacity-50 w-full"
      >
        {loading ? 'Rolling...' : 'Execute Roll'}
      </button>
      
      {loading && rollingText && (
        <motion.div 
          className="mt-6 text-3xl font-bold text-primary font-typewriter"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 0.2 }}
        >
          {rollingText}
        </motion.div>
      )}

      {result && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 text-3xl font-bold text-accent font-typewriter text-center"
        >
          {result}
        </motion.div>
      )}
    </div>
  );
};

export default RNGGame;

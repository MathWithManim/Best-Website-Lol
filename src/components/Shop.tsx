import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Shop = () => {
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const buySingleBoost = useMutation(api.shop.buySingleLuckBoost);
  const buyMinuteBoost = useMutation(api.shop.buyMinuteLuckBoost);
  const activeBoostData = useQuery(api.shop.getActiveBoost);
  const activeBoost = activeBoostData && activeBoostData.expiresAt > Date.now() ? activeBoostData : null;

  const handleBuy = async (type: 'single' | 'minute') => {
    if (buying) return;
    setBuying(type);
    setMessage(null);
    try {
      const mutation = type === 'single' ? buySingleBoost : buyMinuteBoost;
      const result = await mutation();
      if (type === 'single') {
        setMessage(`Bought 1.5x luck for next roll! (${result.newBalance} LB left)`);
      } else {
        setMessage(`Bought 1 minute of 1.5x luck! (${result.newBalance} LB left)`);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-6">
      <m.h3
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70 text-center mb-3"
      >
        Shop
      </m.h3>
      <div className="space-y-2">
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBuy('single')}
          disabled={buying !== null}
          title="Buy 1.5x luck for your next roll"
          className="w-full py-3 px-4 bg-emerald-600 text-white font-mono text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between border border-emerald-500/30"
        >
          <span>1.5x Luck (next roll)</span>
          <span className="text-emerald-200">5 LB</span>
        </m.button>
        <m.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBuy('minute')}
          disabled={buying !== null}
          title="Buy 1.5x luck for 1 minute"
          className="w-full py-3 px-4 bg-sky-600 text-white font-mono text-sm font-bold rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between border border-sky-500/30"
        >
          <span>1.5x Luck (1 min)</span>
          <span className="text-sky-200">20 LB</span>
        </m.button>
      </div>
      <AnimatePresence>
        {activeBoost && (
          <m.div
            initial={{ opacity: 0, scaleY: 0, y: -4 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0, y: -4 }}
            style={{ transformOrigin: 'top' }}
            className="mt-2 text-center text-xs font-mono text-green-500 dark:text-green-400 overflow-hidden"
          >
            ⚡ Active: 1.5x luck ({activeBoost.rollsLeft > 100 ? '1 min' : `${activeBoost.rollsLeft} roll${activeBoost.rollsLeft !== 1 ? 's' : ''}`})
          </m.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {message && (
          <m.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-center text-xs font-mono text-primary dark:text-[#f4d5ad]"
          >
            {message}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
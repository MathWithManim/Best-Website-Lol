import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ShopProps {
  sessionToken: string;
}

const Shop = ({ sessionToken }: ShopProps) => {
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const buySingleBoost = useMutation(api.shop.buySingleLuckBoost);
  const buyMinuteBoost = useMutation(api.shop.buyMinuteLuckBoost);
  const activeBoost = useQuery(api.shop.getActiveBoost, sessionToken ? { sessionToken } : "skip");

  const handleBuy = async (type: 'single' | 'minute') => {
    if (buying) return;
    setBuying(type);
    setMessage(null);
    try {
      const mutation = type === 'single' ? buySingleBoost : buyMinuteBoost;
      const result = await mutation({ sessionToken });
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
      <h3 className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70 text-center mb-3">Shop</h3>
      <div className="space-y-2">
        <button
          onClick={() => handleBuy('single')}
          disabled={buying !== null || !!activeBoost}
          className="w-full py-3 px-4 bg-green-600 text-white font-mono text-sm font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between"
        >
          <span>1.5x Luck (next roll)</span>
          <span className="text-green-200">5 LB</span>
        </button>
        <button
          onClick={() => handleBuy('minute')}
          disabled={buying !== null || !!activeBoost}
          className="w-full py-3 px-4 bg-blue-600 text-white font-mono text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between"
        >
          <span>1.5x Luck (1 min)</span>
          <span className="text-blue-200">20 LB</span>
        </button>
      </div>
      {activeBoost && (
        <div className="mt-2 text-center text-xs font-mono text-green-500 dark:text-green-400">
          ⚡ Active: 1.5x luck ({activeBoost.rollsLeft > 100 ? '1 min' : `${activeBoost.rollsLeft} roll${activeBoost.rollsLeft !== 1 ? 's' : ''}`})
        </div>
      )}
      {message && (
        <div className="mt-2 text-center text-xs font-mono text-primary dark:text-[#f4d5ad]">{message}</div>
      )}
    </div>
  );
};

export default Shop;

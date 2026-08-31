import { useQuery, useMutation, api } from "../../convex/_generated/api";
import { db } from "../db";
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';

import { useUser } from '../lib/useUser';

const COSMETIC_ICONS: Record<string, string> = {
  cat: '🐱',
  math: '∑',
  bird: '🐦',
};

const Shop = () => {
  let isAuthenticated = false;
  try { isAuthenticated = {isAuthenticated:false}.isAuthenticated; } catch { isAuthenticated = false; }
  const user = useUser();
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cosmeticMsg, setCosmeticMsg] = useState<string | null>(null);
  const buySingleBoost = useMutation(api.shop.buySingleLuckBoost);
  const buyMinuteBoost = useMutation(api.shop.buyMinuteLuckBoost);
  const buyCosmetic = useMutation(api.shop.buyCosmetic);
  const equipCosmetic = useMutation(api.shop.equipCosmetic);
  const activeBoostData = useQuery(api.shop.getActiveBoost);
  const activeBoost = activeBoostData && activeBoostData.expiresAt > Date.now() ? activeBoostData : null;
  const cosmetics = useQuery(api.shop.getCosmetics);
  const ownedCosmetics = useQuery(api.shop.getUserCosmetics, isAuthenticated ? {} : "skip");
  const luckBucks = useQuery(api.shop.getLuckBucks, isAuthenticated ? {} : "skip");

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

  const handleCosmetic = async (cosmeticId: string) => {
    if (buying) return;
    const owned = ownedCosmetics?.includes(cosmeticId) ?? false;
    setBuying(cosmeticId);
    setCosmeticMsg(null);
    try {
      if (!owned) {
        await buyCosmetic({ cosmeticId });
      }
      if (user?.equippedCosmetic !== cosmeticId) {
        await equipCosmetic({ cosmeticId });
      }
      const cosmetic = cosmetics?.find((c) => c.id === cosmeticId);
      setCosmeticMsg(cosmetic ? `Equipped ${cosmetic.name}!` : 'Equipped!');
    } catch (err) {
      setCosmeticMsg(err instanceof Error ? err.message : 'Action failed');
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
        transition={{ type: 'spring', damping: 1.0, stiffness: 300 }}
        className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70 text-center mb-3"
      >
        Shop
      </m.h3>
      <div className="space-y-8">
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
      <AnimatePresence>
        {cosmeticMsg && (
          <m.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-center text-xs font-mono text-primary dark:text-[#f4d5ad]"
          >
            {cosmeticMsg}
          </m.div>
        )}
      </AnimatePresence>
      {/* Cosmetics */}
      <m.h3
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', damping: 1.0, stiffness: 300 }}
        className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70 text-center mt-6 mb-3"
      >
        Cosmetics
      </m.h3>
      <div className="space-y-8">
        {cosmetics?.map((cosmetic) => {
          const owned = ownedCosmetics?.includes(cosmetic.id) ?? false;
          const equipped = user?.equippedCosmetic === cosmetic.id;
          const canAfford = (luckBucks ?? 0) >= cosmetic.price;
          return (
            <m.button
              key={cosmetic.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCosmetic(cosmetic.id)}
              disabled={buying !== null || (!owned && !canAfford)}
              title={
                !owned && !canAfford
                  ? `Need ${cosmetic.price} LuckBucks (you have ${(luckBucks ?? 0).toLocaleString()})`
                  : cosmetic.description
              }
              className="w-full py-3 px-4 font-mono text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-between border"
              style={{
                backgroundColor: `${cosmetic.theme.primary}1a`,
                borderColor: equipped ? cosmetic.theme.accent : `${cosmetic.theme.primary}40`,
                color: cosmetic.theme.primary,
              }}
            >
              <span className="flex items-center gap-3">
                <span aria-hidden className="text-xl">{COSMETIC_ICONS[cosmetic.id] ?? cosmetic.icon}</span>
                <span>{cosmetic.name}</span>
              </span>
              <span className="text-xs">
                {equipped ? '✅ Equipped' : owned ? 'Equip' : `${cosmetic.price} LB`}
              </span>
            </m.button>
          );
        })}
      </div>
      <AnimatePresence>
        {cosmeticMsg && (
          <m.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-center text-xs font-mono text-primary dark:text-[#f4d5ad]"
          >
            {cosmeticMsg}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface CosmeticShopProps {
  email: string;
  sessionToken: string;
}

const CosmeticShop = ({ email, sessionToken }: CosmeticShopProps) => {
  const [buying, setBuying] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const cosmetics = useQuery(api.shop.getCosmetics);
  const userCosmetics = useQuery(api.shop.getUserCosmetics, sessionToken ? { sessionToken } : "skip");
  const user = useQuery(api.users.getUser, email ? { email } : "skip");
  const buyCosmetic = useMutation(api.shop.buyCosmetic);
  const equipCosmetic = useMutation(api.shop.equipCosmetic);

  const handleBuy = async (cosmeticId: string) => {
    if (buying) return;
    setBuying(cosmeticId);
    setMessage(null);
    try {
      await buyCosmetic({ sessionToken, cosmeticId });
      setMessage(`Purchased! Click equip to use it.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBuying(null);
    }
  };

  const handleEquip = async (cosmeticId: string) => {
    if (equipping) return;
    setEquipping(cosmeticId);
    setMessage(null);
    try {
      await equipCosmetic({ sessionToken, cosmeticId });
      setMessage(`Equipped!`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Equip failed');
    } finally {
      setEquipping(null);
    }
  };

  if (!cosmetics || !userCosmetics) return null;

  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <h3 className="text-sm font-mono text-primary/70 dark:text-[#f4d5ad]/70 text-center mb-3">Cosmetics</h3>
      <div className="space-y-2">
        {cosmetics.map((cosmetic) => {
          const owned = userCosmetics.includes(cosmetic.id);
          const equipped = user?.equippedCosmetic === cosmetic.id;

          return (
            <div
              key={cosmetic.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 dark:bg-[#f4d5ad]/5 border border-primary/10 dark:border-[#f4d5ad]/10"
            >
              <span className="w-12 h-12 flex items-center justify-center font-mono text-[10px] font-bold bg-black/40 text-white rounded-lg border border-white/10">
                {cosmetic.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-bold text-white">{cosmetic.name}</div>
                <div className="text-xs font-mono text-white/50">{cosmetic.description}</div>
              </div>
              {owned ? (
                <button
                  onClick={() => handleEquip(cosmetic.id)}
                  disabled={equipping !== null || equipped}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    equipped
                      ? 'bg-accent text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  } disabled:opacity-50`}
                >
                  {equipped ? 'Equipped' : 'Equip'}
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(cosmetic.id)}
                  disabled={buying !== null}
                  className="px-3 py-1.5 bg-accent text-white font-mono text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {buying === cosmetic.id ? '...' : cosmetic.price === 0 ? 'Free' : `${cosmetic.price} LB`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {message && (
        <div className="mt-2 text-center text-xs font-mono text-white/70">{message}</div>
      )}
    </div>
  );
};

export default CosmeticShop;

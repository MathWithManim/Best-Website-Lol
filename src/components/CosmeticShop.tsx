import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface CosmeticShopProps {
  email: string;
}

const CosmeticShop = ({ email }: CosmeticShopProps) => {
  const [buying, setBuying] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const cosmetics = useQuery(api.shop.getCosmetics);
  const userCosmetics = useQuery(api.shop.getUserCosmetics, email ? { email } : "skip");
  const user = useQuery(api.users.getUser, email ? { email } : "skip");
  const buyCosmetic = useMutation(api.shop.buyCosmetic);
  const equipCosmetic = useMutation(api.shop.equipCosmetic);

  const handleBuy = async (cosmeticId: string) => {
    if (buying) return;
    setBuying(cosmeticId);
    setMessage(null);
    try {
      await buyCosmetic({ email, cosmeticId });
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
      await equipCosmetic({ email, cosmeticId });
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
              <span className="text-2xl">{cosmetic.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-bold text-primary dark:text-[#f4d5ad]">{cosmetic.name}</div>
                <div className="text-xs font-mono text-primary/50 dark:text-[#f4d5ad]/50">{cosmetic.description}</div>
              </div>
              {owned ? (
                <button
                  onClick={() => handleEquip(cosmetic.id)}
                  disabled={equipping !== null || equipped}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    equipped
                      ? 'bg-green-600 text-white'
                      : 'bg-primary/20 dark:bg-[#f4d5ad]/20 text-primary dark:text-[#f4d5ad] hover:bg-primary/30 dark:hover:bg-[#f4d5ad]/30'
                  } disabled:opacity-50`}
                >
                  {equipped ? 'Equipped' : 'Equip'}
                </button>
              ) : (
                <button
                  onClick={() => handleBuy(cosmetic.id)}
                  disabled={buying !== null}
                  className="px-3 py-1.5 bg-accent text-bg dark:text-[#1a120b] font-mono text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                  {buying === cosmetic.id ? '...' : cosmetic.price === 0 ? 'Free' : `${cosmetic.price} LB`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {message && (
        <div className="mt-2 text-center text-xs font-mono text-primary dark:text-[#f4d5ad]">{message}</div>
      )}
    </div>
  );
};

export default CosmeticShop;

import { useCallback, useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useUser } from '../lib/useUser';
import { RARITY_COLORS } from '../lib/rarities';
import { SHARE_TEMPLATES, drawShareCard, downloadCanvas, type ShareCardData } from '../lib/shareCard';
import { RARITY_VALUES, rarityChancePercent } from '../lib/rarities';

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  rarity: string;
  rarityIndex: number;
  totalRarities: number;
}

const TEMPLATE_KEY = 'shareTemplate:v1';

function loadTemplate(): string {
  try {
    const saved = localStorage.getItem(TEMPLATE_KEY);
    if (saved && SHARE_TEMPLATES.some((t) => t.id === saved)) return saved;
  } catch { /* ignore */ }
  return 'classic';
}

const ShareCardModal = ({ open, onClose, rarity, rarityIndex, totalRarities }: ShareCardModalProps) => {
  const user = useUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [template, setTemplate] = useState(loadTemplate);

  const username = user?.username || user?.email?.split('@')[0] || 'player';
  const accent = RARITY_COLORS[rarity] || '#8B4513';

  const data: ShareCardData = {
    template,
    rarity,
    rarityIndex,
    totalRarities,
    chancePercent: rarityChancePercent(rarityIndex),
    valueLb: RARITY_VALUES[rarityIndex] ?? 1,
    username,
    timestamp: Date.now(),
  };

  useEffect(() => {
    if (open && canvasRef.current) drawShareCard(canvasRef.current, data, accent);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'blocked'>('idle');
  const copyCard = useCallback(async () => {
    try {
      const blob = await new Promise<Blob | null>((res) => canvasRef.current?.toBlob(res, 'image/png'));
      if (!blob) throw new Error('no blob');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyState('copied');
    } catch {
      setCopyState('blocked');
    } finally {
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }, []);

  const handlePick = (id: string) => {
    setTemplate(id);
    try { localStorage.setItem(TEMPLATE_KEY, id); } catch { /* ignore */ }
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Create a share card for this pull"
            className="bg-[#141414] border border-white/10 rounded-2xl p-5 max-w-md w-full flex flex-col gap-4"
          >
            <h3 className="font-mono text-sm font-bold text-white/90 text-center">📸 Share your pull</h3>
            <div className="flex justify-center gap-2">
              {SHARE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handlePick(t.id)}
                  title={`Use the ${t.name} template`}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer ${
                    template === t.id
                      ? 'text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                  style={template === t.id ? { backgroundColor: accent } : undefined}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <canvas
              ref={canvasRef}
              className="w-full aspect-square rounded-xl"
              aria-label="Preview of your share card"
            />
            <div className="flex gap-2">
              <button
                onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, `pull-${rarityIndex + 1}-${rarity}.png`)}
                title="Download the card as PNG"
                className="flex-1 py-2.5 bg-white text-black font-mono text-sm font-bold rounded-lg hover:bg-white/90 transition-colors cursor-pointer"
              >
                ⬇ Download PNG
              </button>
              <button
                onClick={copyCard}
                title="Copy the card image to your clipboard"
                className="px-4 py-2.5 bg-white/10 text-white/80 font-mono text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                {copyState === 'copied' ? '✅ Copied!' : copyState === 'blocked' ? '🚫 Blocked' : '📋 Copy'}
              </button>
              <button
                onClick={onClose}
                title="Close the share dialog"
                className="px-4 py-2.5 bg-white/10 text-white/80 font-mono text-sm rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default ShareCardModal;

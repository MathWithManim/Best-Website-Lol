import { db } from "../../../../db";
import { useState } from 'react';
import { animate, m, useMotionValue } from 'framer-motion';

import { useSettings } from '../../../../lib/settings';

const SEG = 360 / WHEEL_MULTS.length;
const R = 120;

// Pointer reads at 12 o'clock; the server picks the final segment.

const WheelSpin = () => {
  const { settings } = useSettings();
  const rotation = useMotionValue(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setPrize(null);
    setError(null);

    playWheel({})
      .then((res) => {
        const finalMod = (((-90 - (res.segmentIndex * SEG + SEG / 2)) % 360) + 360) % 360;
        const curMod = ((rotation.get() % 360) + 360) % 360;
        const delta = (settings.reduceMotion ? 0 : 6) * 360 + (((finalMod - curMod) % 360) + 360) % 360;

        animate(rotation, rotation.get() + delta, {
          duration: settings.reduceMotion ? 0.05 : 3.2,
          ease: [0.16, 0.9, 0.2, 1],
          onComplete: () => {
            setPrize(
              res.net > 0
                ? `${WHEEL_LABELS[res.segmentIndex]} · +${res.net} LB`
                : 'Nothing. The wheel is cruel.'
            );
            setSpinning(false);
          },
        });
      })
      .catch((err: unknown) => {
        setSpinning(false);
        setError(err instanceof Error ? err.message : 'Spin failed');
      });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[240px] w-[240px] sm:h-[260px] sm:w-[260px]">
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '11px solid transparent',
            borderRight: '11px solid transparent',
            borderTop: '20px solid #5D3A1A',
          }}
        />
        <m.svg viewBox="-130 -130 260 260" className="h-full w-full drop-shadow-lg" style={{ rotate: rotation }}>
          <circle r={R} fill="#F5E6CA" stroke="#5D3A1A" strokeWidth="4" />
          {WHEEL_MULTS.map((_, i) => {
            const rad = (deg: number) => (deg * Math.PI) / 180;
            const a0 = i * SEG;
            const a1 = (i + 1) * SEG;
            const x0 = R * Math.cos(rad(a0));
            const y0 = R * Math.sin(rad(a0));
            const x1 = R * Math.cos(rad(a1));
            const y1 = R * Math.sin(rad(a1));
            const mid = rad(a0 + SEG / 2);
            const lx = 70 * Math.cos(mid);
            const ly = 70 * Math.sin(mid);
            return (
              <g key={i}>
                <path
                  d={`M0 0 L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`}
                  fill={i % 2 === 0 ? '#7048B6' : '#F5E6CA'}
                  stroke="#5D3A1A"
                  strokeWidth="1.5"
                />
                <text
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={WHEEL_LABELS[i] === 'JACKPOT' ? 13 : 15}
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={i % 2 === 0 ? '#F5E6CA' : '#5D3A1A'}
                  transform={`rotate(${a0 + SEG / 2} ${lx} ${ly})`}
                >
                  {WHEEL_LABELS[i]}
                </text>
              </g>
            );
          })}
          <circle r="14" fill="#C9962E" stroke="#5D3A1A" strokeWidth="3" />
        </m.svg>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className="cursor-pointer rounded-xl bg-primary px-10 py-3 font-mono text-sm font-bold text-bg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-accent dark:text-[#1a120b]"
      >
        {spinning ? 'Spinning...' : `Spin (${ARCADE.wheel.cost} LB)`}
      </button>
      <p className="h-7 font-cursive text-2xl font-bold" role="status" aria-live="polite">
        {error && <span className="font-mono text-sm text-red-600 dark:text-red-400">{error}</span>}
        {prize}
      </p>
    </div>
  );
};

export default WheelSpin;

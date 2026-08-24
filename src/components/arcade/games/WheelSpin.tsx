import { useRef, useState } from 'react';
import { animate, m, useMotionValue } from 'framer-motion';
import { useSettings } from '../../../lib/settings';

const SEGMENTS = ['x0', 'x2', 'x0', 'x5', 'x0', 'x3', 'x0', 'JACKPOT'];
const SEG = 360 / SEGMENTS.length;
const SIZE = 260;
const R = 120;

const segmentAtPointer = (rotation: number) => {
  // Pointer sits at the top (12 o'clock), which is -90° in SVG space where
  // segment 0 starts on the +x axis and rotation runs clockwise.
  const norm = (((-90 - rotation) % 360) + 360) % 360;
  return Math.floor(norm / SEG) % SEGMENTS.length;
};

const WheelSpin = () => {
  const { settings } = useSettings();
  const rotation = useMotionValue(0);
  const totalRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setPrize(null);

    const delta = (settings.reduceMotion ? 1 : 6) * 360 + Math.floor(Math.random() * 360);
    totalRef.current += delta;
    const target = rotation.get() + delta;

    animate(rotation, target, {
      duration: settings.reduceMotion ? 0.05 : 3.2,
      ease: [0.16, 0.9, 0.2, 1],
      onComplete: () => {
        const idx = segmentAtPointer(target);
        setPrize(SEGMENTS[idx]);
        setSpinning(false);
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* pointer */}
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2"
          style={{ width: 0, height: 0, borderLeft: '11px solid transparent', borderRight: '11px solid transparent', borderTop: `20px solid #5D3A1A` }}
        />
        <m.svg viewBox="-130 -130 260 260" className="h-full w-full drop-shadow-lg" style={{ rotate: rotation }}>
          <circle r={R} fill="#F5E6CA" stroke="#5D3A1A" strokeWidth="4" />
          {SEGMENTS.map((_, i) => {
            const a0 = i * SEG;
            const a1 = (i + 1) * SEG;
            const rad = (deg: number) => (deg * Math.PI) / 180;
            const x0 = R * Math.cos(rad(a0));
            const y0 = R * Math.sin(rad(a0));
            const x1 = R * Math.cos(rad(a1));
            const y1 = R * Math.sin(rad(a1));
            const mid = rad(a0 + SEG / 2);
            return (
              <g key={i}>
                <path
                  d={`M0 0 L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`}
                  fill={i % 2 === 0 ? '#7048B6' : '#F5E6CA'}
                  stroke="#5D3A1A"
                  strokeWidth="1.5"
                />
                <text
                  x={70 * Math.cos(mid)}
                  y={70 * Math.sin(mid)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={SEGMENTS[i] === 'JACKPOT' ? 13 : 15}
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={i % 2 === 0 ? '#F5E6CA' : '#5D3A1A'}
                  transform={`rotate(${a0 + SEG / 2} ${70 * Math.cos(mid)} ${70 * Math.sin(mid)})`}
                >
                  {SEGMENTS[i]}
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
        {spinning ? 'Spinning...' : 'Spin the wheel'}
      </button>
      <p className="h-6 font-cursive text-2xl font-bold" role="status" aria-live="polite">
        {prize === null ? '' : prize === 'x0' ? 'Nothing. The wheel is cruel.' : prize === 'JACKPOT' ? '🎉 JACKPOT!!' : `You won ${prize} bragging rights`}
      </p>
    </div>
  );
};

export default WheelSpin;

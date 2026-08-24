interface ArtProps {
  color: string;
  dark: string;
}
// Bespoke per-game artwork. Deliberately not an icon set: each tile gets its
// own little illustration in the booth's palette.

export const PlinkoArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <rect x="8" y="8" width="104" height="64" rx="8" fill={dark} opacity="0.25" />
    {[0, 1, 2].map((row) => {
      const count = 5 - row;
      return Array.from({ length: count }, (_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={60 - ((count - 1) / 2) * 16 + col * 16}
          cy={20 + row * 13}
          r="2.4"
          fill="#F5E6CA"
          opacity="0.9"
        />
      ));
    })}
    <circle cx="60" cy="12" r="4.5" fill="#F5E6CA">
      <animate attributeName="cy" values="12;46;12" dur="2.4s" repeatCount="indefinite" />
    </circle>
    {[14, 32, 50, 68, 86, 104].map((x) => (
      <rect key={x} x={x} y="62" width="14" height="10" rx="2" fill={color} stroke="#F5E6CA" strokeWidth="1" opacity="0.95" />
    ))}
  </svg>
);

export const CoinArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <ellipse cx="60" cy="66" rx="26" ry="5" fill={dark} opacity="0.35" />
    <circle cx="60" cy="38" r="24" fill={color} stroke="#F5E6CA" strokeWidth="3" />
    <circle cx="60" cy="38" r="17" fill="none" stroke="#F5E6CA" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.85" />
    <text x="60" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fontFamily="monospace" fill="#F5E6CA">
      H
    </text>
    <path d="M22 30 q-8 8 0 16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7">
      <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1.6s" repeatCount="indefinite" />
    </path>
    <path d="M98 30 q8 8 0 16" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7">
      <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.6s" repeatCount="indefinite" />
    </path>
  </svg>
);

export const SlotsArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <rect x="18" y="14" width="84" height="52" rx="8" fill={dark} opacity="0.3" />
    <rect x="24" y="20" width="72" height="28" rx="4" fill="#F5E6CA" />
    {[36, 60, 84].map((x, i) => (
      <g key={x}>
        <line x1={x - 10} y1="20" x2={x - 10} y2="48" stroke={dark} strokeWidth="1" opacity="0.4" />
        <text x={x} y="40" textAnchor="middle" fontSize="15" fontWeight="bold" fontFamily="monospace" fill={i === 1 ? color : '#5D3A1A'}>
          {['7', '♦', '7'][i]}
        </text>
      </g>
    ))}
    <rect x="34" y="54" width="52" height="8" rx="3" fill={color} />
    <circle cx="102" cy="58" r="5" fill={color} stroke="#F5E6CA" strokeWidth="1.5">
      <animate attributeName="r" values="5;6.4;5" dur="1.2s" repeatCount="indefinite" />
    </circle>
    <line x1="98" y1="56" x2="90" y2="44" stroke={dark} strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const HiLoArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <g transform="rotate(-10 48 42)">
      <rect x="26" y="16" width="34" height="48" rx="5" fill="#F5E6CA" stroke={dark} strokeWidth="1.6" />
      <text x="43" y="47" textAnchor="middle" fontSize="20" fontWeight="bold" fontFamily="serif" fill="#5D3A1A">
        A
      </text>
    </g>
    <g transform="rotate(10 74 42)">
      <rect x="58" y="14" width="36" height="50" rx="5" fill="#F5E6CA" stroke={color} strokeWidth="2.2" />
      <path
        d="M76 28 c-5 -6 -13 -1 -13 5 c0 6 8 10 13 15 c5 -5 13 -9 13 -15 c0 -6 -8 -11 -13 -5 z"
        fill={color}
      />
      <text x="76" y="60" textAnchor="middle" fontSize="11" fontWeight="bold" fontFamily="serif" fill={color}>
        K♥
      </text>
    </g>
  </svg>
);

export const WheelArt = ({ color, dark }: ArtProps) => {
  const segments = 8;
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
      <g transform="translate(60 42)">
        <g transform="rotate(12)">
          {Array.from({ length: segments }, (_, i) => {
            const a0 = (i * 360) / segments;
            const a1 = ((i + 1) * 360) / segments;
            const r = 28;
            const x0 = r * Math.cos((a0 * Math.PI) / 180);
            const y0 = r * Math.sin((a0 * Math.PI) / 180);
            const x1 = r * Math.cos((a1 * Math.PI) / 180);
            const y1 = r * Math.sin((a1 * Math.PI) / 180);
            return (
              <path
                key={i}
                d={`M0 0 L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`}
                fill={i % 2 === 0 ? color : '#F5E6CA'}
                stroke={dark}
                strokeWidth="1"
              />
            );
          })}
        </g>
        <circle r="5" fill="#F5E6CA" stroke={dark} strokeWidth="1.5" />
        <path d="M-4 -32 L4 -32 L0 -22 Z" fill={dark} />
      </g>
      <path d="M100 20 l6 -6 m0 6 l6 -6 m-6 -6 l6 6" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <animate attributeName="opacity" values="0.15;0.8;0.15" dur="1.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
};


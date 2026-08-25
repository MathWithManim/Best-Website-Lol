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

export const DiceArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <rect x="14" y="22" width="36" height="36" rx="7" fill="#F5E6CA" stroke={dark} strokeWidth="1.6" transform="rotate(-8 32 40)" />
    <g transform="rotate(-8 32 40)" fill={dark}>
      <circle cx="24" cy="32" r="3" />
      <circle cx="40" cy="48" r="3" />
    </g>
    <g transform="rotate(9 82 40)">
      <rect x="64" y="22" width="36" height="36" rx="7" fill={color} stroke="#F5E6CA" strokeWidth="2" />
      <g fill="#F5E6CA">
        <circle cx="74" cy="32" r="3" />
        <circle cx="90" cy="32" r="3" />
        <circle cx="82" cy="40" r="3" />
        <circle cx="74" cy="48" r="3" />
        <circle cx="90" cy="48" r="3" />
      </g>
    </g>
    <text x="60" y="18" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold" fill="#F5E6CA" opacity="0.9">
      1-100
    </text>
    <path d="M52 62 h16" stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite" />
    </path>
  </svg>
);

export const MinesArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    {[0, 1, 2].map((row) =>
      [0, 1, 2].map((col) => {
        const x = 30 + col * 22;
        const y = 12 + row * 20;
        const isMine = (row === 0 && col === 2) || (row === 1 && col === 0);
        return isMine ? (
          <g key={`${row}${col}`}>
            <circle cx={x + 8} cy={y + 8} r="7.5" fill={dark} stroke="#F5E6CA" strokeWidth="1.2" />
            <path d={`M${x + 8} ${y + 1.5} v-3 M${x + 8} ${y + 14.5} v3 M${x + 0.5} ${y + 8} h-3 M${x + 15.5} ${y + 8} h3`} stroke="#F5E6CA" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
          </g>
        ) : (
          <rect key={`${row}${col}`} x={x} y={y} width="16" height="16" rx="3.5" fill="#F5E6CA" stroke={color} strokeWidth="1.4" opacity="0.95" />
        );
      })
    )}
    <circle cx="98" cy="20" r="4" fill={color} opacity="0.9">
      <animate attributeName="opacity" values="0.9;0.25;0.9" dur="1.7s" repeatCount="indefinite" />
    </circle>
    <circle cx="98" cy="40" r="4" fill={color} opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.7s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const LimboArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <line x1="24" y1="64" x2="96" y2="64" stroke="#F5E6CA" strokeWidth="1.6" opacity="0.7" />
    {[1.5, 2, 5, 10].map((m, i) => (
      <g key={m}>
        <line x1={28 + i * 18} y1="64" x2={28 + i * 18} y2="58" stroke="#F5E6CA" strokeWidth="1.2" opacity="0.6" />
        <text x={28 + i * 18} y="74" textAnchor="middle" fontSize="7.5" fontFamily="monospace" fill="#F5E6CA" opacity="0.7">
          x{m}
        </text>
      </g>
    ))}
    <circle cx="40" cy="30" r="5" fill={color} stroke="#F5E6CA" strokeWidth="1.4">
      <animate attributeName="cy" values="30;14;30" dur="2.2s" repeatCount="indefinite" />
    </circle>
    <path d="M40 30 C 60 30 74 20 88 14" fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 3" opacity="0.8">
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2.2s" repeatCount="indefinite" />
    </path>
    <text x="96" y="12" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#F5E6CA">
      x50
    </text>
    <rect x="16" y="26" width="10" height="10" rx="2" fill={dark} stroke="#F5E6CA" strokeWidth="0.8" />
  </svg>
);

export const CupsArt = ({ color, dark }: ArtProps) => (
  <svg viewBox="0 0 120 80" className="w-full h-full" aria-hidden>
    <ellipse cx="60" cy="68" rx="44" ry="4.5" fill={dark} opacity="0.35" />
    {[26, 60, 94].map((x, i) => (
      <g key={x}>
        <path d={`M${x - 12} 30 h24 l-4.5 32 h-15 z`} fill={color} stroke="#F5E6CA" strokeWidth="1.6" opacity={i === 1 ? 1 : 0.85} />
        <ellipse cx={x} cy="30" rx="12" ry="3.4" fill="#F5E6CA" stroke={dark} strokeWidth="1" />
      </g>
    ))}
    <circle cx="60" cy="58" r="4" fill="#F5E6CA">
      <animate attributeName="opacity" values="1;1;0;1" dur="2.6s" repeatCount="indefinite" />
    </circle>
  </svg>
);


const RARITIES = [
  { name: "Common", chance: "50%" },
  { name: "Uncommon", chance: "25%" },
  { name: "Rare", chance: "12.5%" },
  { name: "Legendary", chance: "6.25%" },
  { name: "Mythical", chance: "3.125%" },
  { name: "Divine", chance: "1.56%" },
  { name: "Prismatic", chance: "0.78%" },
  { name: "Transcendent", chance: "0.39%" },
  { name: "Epic", chance: "0.19%" },
  { name: "Unique", chance: "0.09%" },
  { name: "Heroic", chance: "0.05%" },
  { name: "Fabled", chance: "0.02%" },
  { name: "Ancient", chance: "0.01%" },
  { name: "Ethereal", chance: "0.006%" },
  { name: "Celestial", chance: "0.003%" },
  { name: "Astral", chance: "0.0015%" },
  { name: "Galactic", chance: "0.0007%" },
  { name: "Infinite", chance: "0.0003%" },
  { name: "Void", chance: "0.0002%" },
  { name: "Chaos", chance: "0.0001%" },
  { name: "Order", chance: "0.0001%" },
  { name: "Reality", chance: "0.0001%" },
  { name: "Existence", chance: "0.0001%" },
  { name: "Infinity", chance: "0.0001%" },
  { name: "Beyond", chance: "0.0001%" },
  { name: "Absolute", chance: "0.0001%" },
  { name: "Final", chance: "0.0001%" },
  { name: "Omega", chance: "0.0001%" },
  { name: "Alpha", chance: "0.0001%" },
  { name: "Zenith", chance: "0.0001%" },
];

const RarityTable = () => (
  <div className="w-full">
    <h3 className="font-mono text-xl text-accent mb-4">Rarities & Chances</h3>
    <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
      {RARITIES.map((r, i) => (
        <div key={i} className="flex justify-between border-b border-primary/10 py-1">
          <span className="text-primary">{r.name}</span>
          <span className="text-secondary">{r.chance}</span>
        </div>
      ))}
    </div>
  </div>
);

export default RarityTable;

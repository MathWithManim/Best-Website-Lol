import { useRef } from 'react';
import { m } from 'framer-motion';
import { DiceIcon } from './Hero';

const FEATURES = [
  { title: 'Dice Roll', desc: 'Slide your odds, roll the fate.', icon: '◆', img: 'https://picsum.photos/seed/dicegame/800/600?grayscale' },
  { title: 'Limbo', desc: 'How low can you go?', icon: '◈', img: 'https://picsum.photos/seed/limbo/800/600?grayscale' },
  { title: 'Lucky Sevens', desc: 'Three reels, one dream.', icon: '7', img: 'https://picsum.photos/seed/slots/800/600?grayscale' },
];

export default function FeaturesBento() {
  return (
    <section className="overflow-x-hidden w-full max-w-full py-24 md:py-40 bg-gradient-to-b from-[#0d0906] via-[#1a120b] to-[#0d0906]" aria-label="Features">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 auto-rows-min grid-flow-dense"
        >
          {/* Large hero card — span 2 cols, 2 rows */}
          <a href="/rng" className="group relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a120b] to-[#2d1e14] border border-[#f4d5ad]/10 hover:border-[#e09f58]/30 transition-all duration-700 hover:-translate-y-1 shadow-[0_0_60px_rgba(224,159,88,0.12)]">
            <div className="absolute inset-0 overflow-hidden">
              <img src={FEATURES[0].img} alt="" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0906] via-transparent to-black/20" />
            </div>
            <div className="relative z-10 p-10 md:p-14 flex flex-col justify-end min-h-[28rem]">
              <span className="font-mono text-xs text-[#e09f58] tracking-[0.3em] uppercase mb-3">Arcade Engine</span>
              <h3 className="font-cursive text-5xl md:text-7xl text-[#f4d5ad] leading-[0.95] mb-4">Dice <span className="italic text-[#e09f58]">Roll</span></h3>
              <p className="font-mono text-sm md:text-base text-[#f4d5ad]/70 max-w-md leading-relaxed">Slide your odds. The server decides — no scripts, no trust issues. Play the RNG game.</p>
            </div>
          </a>

          {/* Standard cards — interlock with large card above/below */}
          <a href="/rng" className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1a120b] to-[#0d0906] border border-[#f4d5ad]/10 hover:border-[#e09f58]/30 transition-all duration-700 hover:-translate-y-1 shadow-[0_0_40px_rgba(224,159,88,0.08)]">
            <div className="p-8 md:p-10 flex flex-col gap-4 min-h-[14rem]">
              <span className="font-mono text-xs text-[#e09f58] tracking-widest">GAME</span>
              <h3 className="font-cursive text-3xl text-[#f4d5ad]">Limbo</h3>
              <p className="font-mono text-sm text-[#f4d5ad]/60 leading-relaxed">How low can you go? Multiply your wager — land under the target.</p>
            </div>
            <img src={FEATURES[1].img} alt="" className="w-full h-48 object-cover opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" />
          </a>

          <a href="/rng" className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14100a] to-[#0d0906] border border-[#f4d5ad]/10 hover:border-[#e09f58]/30 transition-all duration-700">
            <div className="p-8 md:p-10 flex flex-col gap-4 min-h-[14rem]">
              <span className="font-mono text-xs text-[#e09f58] tracking-widest">GAME</span>
              <h3 className="font-cursive text-3xl text-[#f4d5ad]">Lucky Sevens</h3>
              <p className="font-mono text-sm text-[#f4d5ad]/60 leading-relaxed">Three reels, one dream. Triple 7 pays out big.</p>
            </div>
            <img src={FEATURES[2].img} alt="" className="w-full h-48 object-cover opacity-40 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" />
          </a>
        </m.div>
      </div>
    </section>
  );
}

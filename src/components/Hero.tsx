import { m } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] md:h-[calc(100vh-80px)] p-6 relative">
      <m.div
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-7xl md:text-9xl lg:text-[12rem] font-bold text-center"
      >
        <h1 className="text-primary dark:text-[#f4d5ad] font-cursive flex items-center justify-center">
          Jasper
        </h1>
        <h1 className="text-accent dark:text-[#c98a6e] font-cursive flex items-center justify-center">
          Sona
        </h1>
      </m.div>

      {/* CTA above the fold */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 flex flex-col items-center gap-4"
      >
        <Link
          to="/rng"
          className="px-8 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-xl hover:opacity-90 transition-opacity active:scale-95"
          title="Start playing the RNG gacha game"
        >
          🎲 Play RNG Game
        </Link>
        <p className="font-mono text-xs text-primary/40 dark:text-[#f4d5ad]/40">
          Roll for rare items. Collect them all.
        </p>
      </m.div>
    </section>
  );
};

export default Hero;
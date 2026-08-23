import { m } from 'framer-motion';
import { INTRO, TAGLINE } from '../lib/portfolio';

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] md:h-[calc(100vh-80px)] p-6 relative">
      <m.div
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-7xl md:text-9xl lg:text-[10rem] font-bold text-center leading-none"
      >
        <h1 className="text-primary dark:text-[#f4d5ad] font-cursive flex items-center justify-center">
          Jasper
        </h1>
        <h1 className="text-accent dark:text-[#c98a6e] font-cursive flex items-center justify-center">
          Sona
        </h1>
      </m.div>

      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-4 font-mono text-sm md:text-base font-bold text-accent dark:text-[#c98a6e] text-center"
      >
        {TAGLINE}
      </m.p>
      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="mt-2 max-w-md font-mono text-xs md:text-sm text-primary/60 dark:text-[#f4d5ad]/60 text-center leading-relaxed"
      >
        {INTRO}
      </m.p>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <a
          href="#projects"
          className="px-8 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-xl hover:opacity-90 transition-opacity active:scale-95"
          title="Jump to projects"
        >
          View Work
        </a>
        <a
          href="#contact"
          className="px-8 py-3 bg-secondary/30 dark:bg-secondary/10 border border-primary/20 dark:border-[#f4d5ad]/20 text-primary dark:text-[#f4d5ad] font-mono text-sm font-bold rounded-xl hover:opacity-90 hover:border-accent dark:hover:border-[#c98a6e] transition-all active:scale-95"
          title="Jump to contact"
        >
          Get in Touch
        </a>
      </m.div>
    </section>
  );
};

export default Hero;

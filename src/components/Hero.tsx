import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { INTRO, TAGLINE } from '../lib/portfolio';

const DiceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="h-4 w-4 shrink-0"
  >
    <rect width="18" height="18" x="3" y="3" rx="4" ry="4" />
    <path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" />
  </svg>
);

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[60vh] md:h-[calc(100vh-80px)] p-6 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f4d5ad]/10 to-transparent" />

      <m.div
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative text-6xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.85] text-left md:text-left max-w-6xl mx-auto px-6 md:px-10"
      >
        <h1 className="font-sans text-primary dark:text-[#f4d5ad]">
          <span className="block">Jasper</span>
          <span className="block text-accent">Sona</span>
          <span className="inline-flex items-center gap-3 mt-2 text-2xl md:text-4xl lg:text-5xl font-mono text-primary/70 dark:text-[#f4d5ad]/60 tracking-tight not-italic font-normal">
            <span className="inline-block w-14 h-8 md:w-20 md:h-10 rounded-full overflow-hidden shadow-xl ring-2 ring-[#e09f58]/30 align-middle bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/seed/jasper-hero/200/160)' }} aria-hidden="true" />
            <span>the RNG game that actually ships</span>
          </span>
        </h1>
      </m.div>

      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative mt-4 font-mono text-sm md:text-base font-bold text-accent text-center tracking-wide"
      >
        {TAGLINE}
      </m.p>
      <m.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="relative mt-2 max-w-md font-mono text-xs md:text-sm text-primary/60 text-center leading-relaxed"
      >
        {INTRO}
      </m.p>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative mt-10 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          to="/rng"
          title="Play the RNG game"
          className="inline-flex items-center gap-2.5 px-8 py-3 bg-accent text-[#1a120b] font-mono text-sm font-bold rounded-xl shadow-[0_0_28px_rgba(224,159,88,0.28)] hover:shadow-[0_0_42px_rgba(224,159,88,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
        >
          <DiceIcon />
          Play RNG
        </Link>
        <a
          href="#contact"
          className="inline-flex items-center px-8 py-3 bg-secondary/10 border border-primary/25 text-primary font-mono text-sm font-bold rounded-xl hover:border-accent hover:text-accent hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          title="Jump to contact"
        >
          Get in Touch
        </a>
      </m.div>
    </section>
  );
};

export default Hero;

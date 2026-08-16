import { motion } from 'framer-motion';

const RNGSection = () => {
  return (
    <section className="p-10 border-t border-primary/20 bg-secondary/5">
      <a 
        href="https://example.com" 
        className="block font-mono max-w-2xl mx-auto p-6 bg-[#4A2E0D] text-[#D2B48C] rounded border border-primary/20 hover:border-accent transition-all group"
      >
        <div className="flex items-center mb-2 text-accent">
          <span className="mr-2">&gt;</span>
          <span>./rng_game --execute</span>
        </div>
        <div className="text-secondary/70 text-sm">
          [Status: Ready]
        </div>
        <div className="mt-4 flex items-center">
          <span className="text-accent mr-1">_</span>
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-2 h-5 bg-accent inline-block"
          />
        </div>
      </a>
    </section>
  );
};

export default RNGSection;

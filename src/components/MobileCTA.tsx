import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MobileCTA = () => {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom"
    >
      <div className="bg-primary/95 dark:bg-[#2d1e14]/95 backdrop-blur-lg border-t border-primary/20 dark:border-[#f4d5ad]/20 px-4 py-3">
        <Link
          to="/rng"
          className="flex items-center justify-center w-full py-3 bg-accent dark:bg-[#c98a6e] text-bg dark:text-[#1a120b] font-mono text-sm font-bold rounded-xl hover:opacity-90 transition-opacity active:scale-95"
        >
          🎲 Play RNG Game
        </Link>
      </div>
    </motion.div>
  );
};

export default MobileCTA;

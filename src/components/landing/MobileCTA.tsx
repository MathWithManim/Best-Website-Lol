import { m } from 'framer-motion';

const MobileCTA = () => {
  return (
    <m.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom"
    >
      <div className="bg-primary/95 dark:bg-[#2d1e14]/95 backdrop-blur-lg border-t border-primary/20 dark:border-[#f4d5ad]/20 px-4 py-3">
      </div>
    </m.div>
  );
};

export default MobileCTA;
import { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';

const CookieBanner = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setAccepted(true);
  };

  return (
    <AnimatePresence>
      {!accepted && (
        <m.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-primary dark:bg-[#2d1e14] text-bg dark:text-[#f4d5ad] p-4 flex flex-col md:flex-row items-center justify-between gap-4 z-50 shadow-lg font-mono text-sm border-t border-primary/20 dark:border-[#f4d5ad]/20"
        >
          <p>We use cookies to ensure you get the best experience on our site.</p>
          <button 
            onClick={handleAccept}
            className="px-6 py-2 bg-accent text-bg rounded font-bold hover:bg-darker transition-colors cursor-pointer"
          >
            Got it
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;

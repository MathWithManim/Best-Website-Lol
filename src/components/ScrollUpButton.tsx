import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollUpButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-20 z-40 w-12 h-12 rounded-full bg-accent text-bg flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
          title="Scroll to top"
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollUpButton;

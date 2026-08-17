import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 p-4 bg-secondary/10 border border-primary/20 rounded-xl shadow-xl font-mono text-xs text-primary bg-bg/95 backdrop-blur"
          >
            <p className="font-bold mb-1">Contact Info:</p>
            <p className="mb-1">Email: <a href="mailto:mathmanim09@gmail.com" className="text-accent underline">mathmanim09@gmail.com</a></p>
            <p>TikTok: <a href="https://tiktok.com/@mathwowamazing" target="_blank" rel="noreferrer" className="text-accent underline">@mathwowamazing</a></p>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-primary text-bg flex items-center justify-center font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer"
        title="Contact"
      >
        💬
      </button>
    </div>
  );
};

export default FloatingContact;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  const [jasperText, setJasperText] = useState('');
  const [sonaText, setSonaText] = useState('');
  const fullJasper = "Jasper";
  const fullSona = "Sona";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullJasper.length) {
        setJasperText(fullJasper.slice(0, i));
      }
      if (i <= fullSona.length) {
        setSonaText(fullSona.slice(0, i));
      }
      i++;
      if (i > Math.max(fullJasper.length, fullSona.length)) {
        clearInterval(timer);
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] md:h-[calc(100vh-80px)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-7xl md:text-9xl lg:text-[12rem] font-bold text-center"
      >
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-primary dark:text-[#f4d5ad] font-cursive flex items-center justify-center"
        >
          {jasperText}
          <span className="animate-pulse ml-1 text-accent dark:text-[#c98a6e]">|</span>
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-accent dark:text-[#c98a6e] font-cursive flex items-center justify-center"
        >
          {sonaText}
        </motion.h1>
      </motion.div>

      {/* Subtle floating particles behind the name */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent/20 dark:bg-[#c98a6e]/20"
            style={{
              left: `${15 + i * 14}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;

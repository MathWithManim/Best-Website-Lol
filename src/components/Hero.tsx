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
        className="text-7xl md:text-9xl lg:text-[12rem] font-bold text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <h1 className="text-primary font-cursive flex items-center justify-center">
          {jasperText}
          <span className="animate-pulse ml-1 text-accent">|</span>
        </h1>
        <h1 className="text-accent font-cursive flex items-center justify-center">
          {sonaText}
        </h1>
      </motion.div>
    </section>
  );
};

export default Hero;

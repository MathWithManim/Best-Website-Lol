import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
      <motion.div 
        className="text-9xl md:text-[12rem] font-bold text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-primary font-cursive"
        >
          Jasper
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-accent font-cursive"
        >
          Sona
        </motion.h1>
      </motion.div>
    </section>
  );
};

export default Hero;

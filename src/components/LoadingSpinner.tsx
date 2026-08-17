import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-bg z-50">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        }}
        className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full"
      />
    </div>
  );
};

export default LoadingSpinner;

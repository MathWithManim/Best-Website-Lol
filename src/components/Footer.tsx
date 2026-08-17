import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-10 border-t border-primary/20 dark:border-[#f4d5ad]/20 text-center font-typewriter text-primary dark:text-[#f4d5ad] bg-secondary/5 dark:bg-secondary/5"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex justify-center gap-6 mb-4 font-sans"
      >
        <Link to="/terms" className="hover:underline hover:text-accent dark:hover:text-[#c98a6e] transition-colors">Terms and Conditions</Link>
        <Link to="/privacy" className="hover:underline hover:text-accent dark:hover:text-[#c98a6e] transition-colors">Privacy Policy</Link>
        <Link to="/cookies" className="hover:underline hover:text-accent dark:hover:text-[#c98a6e] transition-colors">Cookie Policy</Link>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mb-2"
      >
        &copy; {new Date().getFullYear()} Jasper Sona. All rights reserved.
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="text-xs font-mono text-primary/60 dark:text-[#f4d5ad]/60"
      >
        Last updated: August 16, 2026
      </motion.p>
    </motion.footer>
  );
};

export default Footer;

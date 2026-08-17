import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="p-10 border-t border-primary/20 dark:border-[#f4d5ad]/20 text-center font-typewriter text-primary dark:text-[#f4d5ad] bg-secondary/5 dark:bg-secondary/5">
      <div className="flex justify-center gap-6 mb-4 font-sans">
        <Link to="/terms" className="hover:underline">Terms and Conditions</Link>
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link to="/cookies" className="hover:underline">Cookie Policy</Link>
      </div>
      <p className="mb-2">&copy; {new Date().getFullYear()} Jasper Sona. All rights reserved.</p>
      <p className="text-xs font-mono text-primary/60 dark:text-[#f4d5ad]/60">Last updated: August 16, 2026</p>
    </footer>
  );
};

export default Footer;

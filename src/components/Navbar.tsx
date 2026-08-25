import { useState } from 'react';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { useConvexAuth } from 'convex/react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/rng', label: 'RNG Game' },
  { to: '/rng', label: 'Sign Up', guestOnly: true },
  { to: '/rng', label: 'Login', guestOnly: true },
  { to: '/profile', label: 'Profile', authOnly: true },
  { to: '/settings', label: 'Settings', authOnly: true },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useConvexAuth();

  const visibleLinks = navLinks.filter(
    (l) => (l.authOnly ? isAuthenticated : true) && !(l.guestOnly && isAuthenticated)
  );

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-[#F5E6CA]/90 dark:bg-[#1a120b]/90 flex items-center justify-between p-6 text-[#8B4513] dark:text-[#f4d5ad] border-b border-[#8B4513]/20 dark:border-[#f4d5ad]/20">
      <Link to="/" className="font-typewriter text-2xl font-bold">JASPER SONA</Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        <ul className="flex gap-6 font-typewriter items-center">
          {visibleLinks.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                title={`Navigate to ${link.label}`}
                className="relative hover:text-accent dark:hover:text-[#c98a6e] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Mobile controls */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="font-mono relative w-8 h-8 flex items-center justify-center"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <m.span
            className="absolute block h-0.5 w-5 bg-current rounded"
            animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          />
          <m.span
            className="absolute block h-0.5 w-5 bg-current rounded"
            animate={isOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          />
          <m.span
            className="absolute block h-0.5 w-5 bg-current rounded"
            animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, scaleY: 0, y: -8 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
            className="md:hidden absolute top-full left-0 w-full overflow-hidden bg-[#F5E6CA] dark:bg-[#1a120b] border-b border-[#8B4513]/20 shadow-lg z-40"
          >
            <ul className="flex flex-col gap-4 font-typewriter p-6">
              {visibleLinks.map((link, i) => (
                <m.li
                  key={link.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.2 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block py-1 hover:text-accent dark:hover:text-[#c98a6e] transition-colors"
                  >
                    {link.label}
                  </Link>
                </m.li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

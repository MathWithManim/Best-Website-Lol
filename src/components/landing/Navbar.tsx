import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  let isAuthenticated = false;
  try { isAuthenticated = useConvexAuth().isAuthenticated; } catch { isAuthenticated = false; }
  const { pathname } = useLocation();
  const visibleLinks = navLinks.filter((l) => (l.authOnly ? isAuthenticated : true) && !(l.guestOnly && isAuthenticated));
  const activeTo = visibleLinks.find((l) => l.to === pathname)?.to;

  return (
    <div className="sticky top-0 z-40 w-full flex justify-center pt-5 md:pt-6 px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-6 md:gap-10 px-5 md:px-7 py-3 rounded-full bg-white/80 dark:bg-[#1a120b]/70 backdrop-blur-xl backdrop-saturate-150 border border-[#8B4513]/10 dark:border-white/10 shadow-[0_8px_32px_rgba(139,69,19,0.12),0_1px_0_rgba(255,255,255,0.6)_inset] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-5xl w-full">
        <Link to="/" className="font-typewriter text-[1.05rem] md:text-lg font-bold tracking-[0.14em] text-[#1a120b] dark:text-[#f4d5ad] shrink-0">
          JASPER SONA
        </Link>

        <div className="hidden md:flex items-center gap-1.5">
          {visibleLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={activeTo === link.to ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[13px] font-bold tracking-wide transition-all ${
                activeTo === link.to
                  ? 'bg-[#1a120b] text-[#f4d5ad] dark:bg-[#f4d5ad] dark:text-[#1a120b] shadow-sm'
                  : 'text-[#8B4513]/70 dark:text-[#f4d5ad]/60 hover:text-[#1a120b] dark:hover:text-[#f4d5ad] hover:bg-[#F5E6CA] dark:hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/rng"
            className="ml-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1a120b] dark:bg-[#f4d5ad] text-[#f4d5ad] dark:text-[#1a120b] font-mono text-[13px] font-bold shadow-[0_4px_16px_rgba(26,18,11,0.2)] hover:translate-y-[-1px] transition-transform"
          >
            Play <span aria-hidden>→</span>
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden relative w-9 h-9 grid place-items-center rounded-full bg-[#1a120b] dark:bg-[#f4d5ad] text-[#f4d5ad] dark:text-[#1a120b]"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
        >
          <m.span className="absolute block h-0.5 w-4 bg-current rounded" animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }} transition={{ duration: 0.2 }} />
          <m.span className="absolute block h-0.5 w-4 bg-current rounded" animate={isOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.15 }} />
          <m.span className="absolute block h-0.5 w-4 bg-current rounded" animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }} transition={{ duration: 0.2 }} />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden absolute top-[72px] left-4 right-4 rounded-[20px] bg-white/90 dark:bg-[#1a120b]/90 backdrop-blur-xl border border-[#8B4513]/10 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.18)] overflow-hidden pointer-events-auto"
          >
            <ul className="flex flex-col p-3">
              {visibleLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-full font-mono text-sm font-bold ${activeTo === link.to ? 'bg-[#1a120b] text-[#f4d5ad] dark:bg-[#f4d5ad] dark:text-[#1a120b]' : 'text-[#1a120b] dark:text-[#f4d5ad]'}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;

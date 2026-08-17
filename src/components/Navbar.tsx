import { useState } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-[#F5E6CA]/90 dark:bg-[#1a120b]/90 flex items-center justify-between p-6 text-[#8B4513] dark:text-[#f4d5ad] border-b border-[#8B4513]/20 dark:border-[#f4d5ad]/20">
      <Link to="/" className="font-typewriter text-2xl font-bold">JASPER SONA</Link>

      <div className="hidden md:flex items-center gap-6">
        <ul className="flex gap-6 font-typewriter items-center">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/rng">RNG Game</Link></li>
          {isLoggedIn && <li><Link to="/profile">Profile</Link></li>}
        </ul>
        <DarkModeToggle />
      </div>

      <div className="md:hidden flex items-center gap-4">
        <DarkModeToggle />
        <button onClick={() => setIsOpen(!isOpen)} className="font-mono">
          {isOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden absolute top-20 left-0 w-full bg-[#F5E6CA] dark:bg-[#1a120b] p-6 border-b border-[#8B4513]/20 shadow-lg`}>
        <ul className="flex flex-col gap-4 font-typewriter">
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/rng" onClick={() => setIsOpen(false)}>RNG Game</Link></li>
          {isLoggedIn && <li><Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link></li>}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

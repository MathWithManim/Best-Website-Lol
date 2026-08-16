import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between p-6 bg-bg text-primary border-b border-primary/20">
      <div className="font-typewriter text-2xl font-bold">JASPER SONA</div>
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close' : 'Menu'}
        </button>
      </div>
      <div className={`${isOpen ? 'block' : 'hidden'} md:block absolute md:static top-20 left-0 w-full md:w-auto bg-bg p-6 md:p-0`}>
        <ul className="flex flex-col md:flex-row gap-6 font-typewriter">
          <li>Home</li>
          <li>Projects</li>
          <li>Contact</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

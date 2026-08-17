import { useState, useEffect } from 'react';
import RNGGame from '../components/RNGGame';
import RarityTable from '../components/RarityTable';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';

const RNGPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(logged);
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <AuthModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="p-10 flex flex-col md:flex-row gap-10 items-start justify-center">
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h1 className="text-4xl font-sans font-bold mb-8 text-primary">RNG Game</h1>
          <RNGGame />
        </div>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-1/3 bg-secondary/5 p-6 rounded-lg border border-primary/20">
          <RarityTable />
        </div>

        {/* Mobile Modal Trigger */}
        <button 
          className="md:hidden fixed bottom-6 right-6 px-4 py-2 bg-accent text-bg rounded-full font-mono shadow-lg hover:scale-105 transition-transform"
          onClick={() => setIsModalOpen(true)}
        >
          View Rarities
        </button>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg/90 p-6 flex flex-col items-center z-50 md:hidden"
          >
            <button className="self-end mb-4 text-primary font-mono" onClick={() => setIsModalOpen(false)}>Close</button>
            <RarityTable />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RNGPage;

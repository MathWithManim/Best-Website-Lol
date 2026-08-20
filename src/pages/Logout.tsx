import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';

const Logout = () => {
  const navigate = useNavigate();
  const loggedOut = useRef(false);

  useEffect(() => {
    if (loggedOut.current) return;
    loggedOut.current = true;

    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rarityData');

    authClient.signOut().finally(() => navigate('/'));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center">
      <p className="text-primary dark:text-[#f4d5ad] font-mono">Signing out...</p>
    </div>
  );
};

export default Logout;
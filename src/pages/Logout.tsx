import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    navigate('/rng');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center">
      <p className="text-primary dark:text-[#f4d5ad] font-mono">Signing out...</p>
    </div>
  );
};

export default Logout;

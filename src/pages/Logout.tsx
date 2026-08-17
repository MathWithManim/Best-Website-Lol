import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const Logout = () => {
  const navigate = useNavigate();
  const logoutMutation = useMutation(api.users.logout);
  const loggedOut = useRef(false);

  useEffect(() => {
    if (loggedOut.current) return;
    loggedOut.current = true;

    const token = localStorage.getItem('sessionToken');
    localStorage.clear();

    if (token) {
      logoutMutation({ sessionToken: token }).finally(() => navigate('/rng'));
    } else {
      navigate('/rng');
    }
  }, [navigate, logoutMutation]);

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center">
      <p className="text-primary dark:text-[#f4d5ad] font-mono">Signing out...</p>
    </div>
  );
};

export default Logout;

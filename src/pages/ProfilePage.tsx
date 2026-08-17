import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (!storedEmail) {
      navigate('/rng');
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const user = useQuery(api.users.getUser, email ? { email } : "skip");
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [pfp, setPfp] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setPfp(user.pfp || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await updateProfile({ email, name, username, bio, pfp });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/rng');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg dark:bg-[#1a120b] flex items-center justify-center font-mono text-primary dark:text-[#f4d5ad]">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] text-primary dark:text-[#f4d5ad] transition-colors duration-300">
      <Navbar />
      <main className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-sans font-bold">User Profile</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-mono rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-secondary/10 dark:bg-secondary/5 border border-primary/20 dark:border-[#f4d5ad]/20 p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img 
              src={pfp || "https://api.dicebear.com/7.x/bottts/svg?seed=default"} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border-2 border-accent bg-bg dark:bg-[#2d1e14] object-cover"
            />
            <div className="flex-1 w-full">
              <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Profile Picture URL</label>
              <input 
                type="text" 
                value={pfp}
                onChange={(e) => setPfp(e.target.value)}
                className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block font-mono text-sm mb-1 text-primary dark:text-[#f4d5ad]">Bio</label>
            <textarea 
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#2d1e14] border border-primary/30 dark:border-[#f4d5ad]/30 font-mono text-sm text-primary dark:text-[#f4d5ad] focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="submit"
              className="px-6 py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Save Changes
            </button>
            {saved && <span className="text-green-600 dark:text-green-400 font-mono text-sm">Saved successfully!</span>}
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;

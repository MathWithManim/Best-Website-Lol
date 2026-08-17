import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';

const RootAdmin = () => {
  const navigate = useNavigate();
  const sessionToken = localStorage.getItem('sessionToken');
  const [editingLuckBucks, setEditingLuckBucks] = useState<Record<string, number>>({});
  
  const users = useQuery(api.users.listUsers, sessionToken ? { sessionToken } : "skip");
  const updateStats = useMutation(api.users.updateUserStats);
  const deleteUser = useMutation(api.users.deleteUser);

  useEffect(() => {
    // Basic frontend check, though the backend enforces security
    if (localStorage.getItem('userEmail') !== 'root@root.root') {
      navigate('/rng');
    }
  }, [navigate]);

  if (!users) return <div className="p-8 text-center">Loading admin...</div>;

  return (
    <div className="min-h-screen bg-bg dark:bg-[#1a120b] p-8 text-primary dark:text-[#f4d5ad]">
      <h1 className="text-4xl font-bold mb-8 font-sans border-b border-primary/20 pb-4">Root Admin Panel</h1>
      <div className="bg-secondary/10 p-6 rounded-2xl border border-primary/20">
        <table className="w-full">
          <thead>
            <tr className="text-left font-mono text-xs uppercase tracking-wider text-primary/60 border-b border-primary/20">
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">LuckBucks</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user._id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                <td className="p-4 font-mono font-bold">{user.username}</td>
                <td className="p-4 font-mono text-sm">{user.email}</td>
                <td className="p-4">
                  <input
                    type="number"
                    defaultValue={user.luckbucks || 0}
                    onChange={(e) => setEditingLuckBucks({ ...editingLuckBucks, [user._id]: parseInt(e.target.value) })}
                    className="bg-bg dark:bg-[#2d1e14] p-2 rounded-lg border border-primary/20 w-32 font-mono"
                  />
                </td>
                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => updateStats({ sessionToken: sessionToken!, userId: user._id, luckbucks: editingLuckBucks[user._id] || user.luckbucks || 0 })}
                    className="px-4 py-2 bg-accent text-bg rounded-lg text-sm font-bold hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteUser({ sessionToken: sessionToken!, userId: user._id })}
                    className="px-4 py-2 bg-red-600/10 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RootAdmin;

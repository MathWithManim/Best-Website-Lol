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
      <h1 className="text-3xl font-bold mb-6">Root Admin Panel</h1>
      <table className="w-full bg-secondary/10 rounded-lg">
        <thead>
          <tr className="text-left font-mono text-sm border-b border-primary/20">
            <th className="p-3">Username</th>
            <th className="p-3">Email</th>
            <th className="p-3">LuckBucks</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user._id} className="border-b border-primary/10">
              <td className="p-3 font-mono">{user.username}</td>
              <td className="p-3 font-mono">{user.email}</td>
              <td className="p-3">
                <input
                  type="number"
                  defaultValue={user.luckbucks || 0}
                  onChange={(e) => setEditingLuckBucks({ ...editingLuckBucks, [user._id]: parseInt(e.target.value) })}
                  className="bg-bg dark:bg-[#2d1e14] p-1 rounded border border-primary/20 w-24"
                />
              </td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => updateStats({ sessionToken: sessionToken!, userId: user._id, luckbucks: editingLuckBucks[user._id] || user.luckbucks || 0 })}
                  className="px-2 py-1 bg-accent text-bg rounded text-xs font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteUser({ sessionToken: sessionToken!, userId: user._id })}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RootAdmin;

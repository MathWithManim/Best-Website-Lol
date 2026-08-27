import { db } from "../../../db"; import { users as usersTable } from "../../../db/schema"; import { eq } from "drizzle-orm";
import { useRef } from 'react';
import { db } from "../../../db";
import { useUser } from '../lib/useUser';

const RootAdmin = () => {
  const user = useUser();
  const editingLuckBucks = useRef<Record<string, number>>({});

  const users = db.select().from(usersTable).limit(100); // Drizzle query stub
  const updateStats = (id: number) => db.update(usersTable).set({}).where(eq(usersTable.id, id));
  const deleteUser = (id: number) => db.delete(usersTable).where(eq(usersTable.id, id));

  if (user?.email !== 'root@root.root') {
    return <div className="min-h-screen bg-bg dark:bg-[#1a120b] p-8 text-center text-primary dark:text-[#f4d5ad] font-mono">Access denied.</div>;
  }

  if (users === undefined) return <div className="p-8 text-center">Loading admin...</div>;

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
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        const next = { ...editingLuckBucks.current };
                        delete next[user._id];
                        editingLuckBucks.current = next;
                        return;
                      }
                      const parsed = Number(raw);
                      if (!Number.isNaN(parsed)) {
                        editingLuckBucks.current = {
                          ...editingLuckBucks.current,
                          [user._id]: parsed,
                        };
                      }
                    }}
                    aria-label={`LuckBucks for ${user.username}`}
                    className="bg-bg dark:bg-[#2d1e14] p-2 rounded-lg border border-primary/20 w-32 font-mono"
                  />
                </td>
                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => updateStats({ userId: user._id, luckbucks: editingLuckBucks.current[user._id] ?? user.luckbucks ?? 0 })}
                    className="px-4 py-2 bg-accent text-bg rounded-lg text-sm font-bold hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteUser({ userId: user._id })}
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
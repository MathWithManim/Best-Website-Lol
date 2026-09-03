import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { useUser } from '../../lib/useUser';
import { useSettings } from '../../lib/settings';
import { authClient } from '../../lib/auth-client';

interface Props {
  open: boolean;
  onClose: () => void;
}

const OVERRIDES_KEY = 'profile:overrides:v1';

function loadOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

const ToggleRow = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean)=>void }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={()=>onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 py-3 text-left cursor-pointer group"
  >
    <span>
      <span className="block font-mono text-sm font-bold text-white">{label}</span>
      {description && <span className="block text-xs font-mono text-white/50 mt-0.5">{description}</span>}
    </span>
    <span className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-[#c98a6e]' : 'bg-white/20'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);

const AccountSettingsModal = ({ open, onClose }: Props) => {
  const user = useUser() as any;
  const { settings, setSetting } = useSettings();
  const [activeTab, setActiveTab] = useState<'profile'|'settings'>('profile');

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [pfp, setPfp] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [dataMsg, setDataMsg] = useState<string|null>(null);

  // try to get mutation if backend exists, otherwise no-op
  let updateProfile: any = null;

  useEffect(()=>{
    if (open && user) {
      const overrides = loadOverrides();
      setName(overrides.name ?? user.name ?? '');
      setUsername(overrides.username ?? user.username ?? '');
      setBio(overrides.bio ?? user.bio ?? '');
      setPfp(overrides.pfp ?? user.pfp ?? '');
      setMsg(null); setErr(null); setDataMsg(null);
      setActiveTab('profile');
    }
  }, [open, user]);

  // close on esc
  useEffect(()=>{
    if (!open) return;
    const h = (e: KeyboardEvent)=>{ if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown', h);
    return ()=>window.removeEventListener('keydown', h);
  }, [open, onClose]);

  // lock scroll
  useEffect(()=>{
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return ()=>{ document.body.style.overflow = prev; };
    }
  }, [open]);

  const handleSave = async (e: React.FormEvent)=>{
    e.preventDefault();
    setErr(null); setMsg(null);
    if (name.length > 50) { setErr('Display name too long (max 50)'); return; }
    if (bio.length > 500) { setErr('Bio too long (max 500)'); return; }
    if (username && !/^[a-zA-Z0-9._-]{2,32}$/.test(username)) { setErr('Username: 2-32 letters/numbers/._- only'); return; }
    setSaving(true);
    try {
      // try better-auth update for name + image
      try {
        const maybeUpdate: any = (authClient as any).updateUser;
        if (typeof maybeUpdate === 'function') {
          await maybeUpdate({ name, image: pfp });
        }
      } catch (e) { console.warn('[settings] auth updateUser failed', e); }

      if (updateProfile) {
        try { await updateProfile({ name, username, bio, pfp } as any); } catch (e) { console.warn('[settings] updateProfile failed (stub backend)', e); }
      }

      // always persist overrides locally so UI reflects immediately
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify({ name, username, bio, pfp }));
      // dispatch event so UserProvider or other listeners could react
      window.dispatchEvent(new CustomEvent('profile:updated', { detail: { name, username, bio, pfp } }));
      setMsg('Saved ✓');
      setTimeout(()=>setMsg(null), 2500);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleLogout = async ()=>{
    try { await authClient.signOut(); } catch {}
    localStorage.removeItem('userEmail');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('isLoggedIn');
    // keep rarityData? clear on logout like SettingsPage did? keep it for now but clear profile overrides
    // localStorage.removeItem(OVERRIDES_KEY);
    onClose();
    window.location.href = '/';
  };

  const handleClearCache = ()=>{
    if (!window.confirm('Clear locally cached rarity collection? Server data not affected.')) return;
    localStorage.removeItem('rarityData');
    setDataMsg('Local cache cleared.');
    setTimeout(()=>setDataMsg(null), 3000);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
            aria-hidden
          />
          <m.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Account settings"
              onClick={(e)=>e.stopPropagation()}
              className="pointer-events-auto w-full max-w-[560px] max-h-[90vh] overflow-hidden rounded-[24px] bg-[#1a120b] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.6)] flex flex-col"
            >
              {/* header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 15a1.65 1.65 0 0 0-1-1.51V13a1.65 1.65 0 0 0 1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 13.5 7a1.65 1.65 0 0 0 1 1.51V9a1.65 1.65 0 0 0-1 1.51 1.65 1.65 0 0 0 .33 1.82Z"/></svg>
                  </div>
                  <h2 className="text-lg font-sans font-bold text-white tracking-tight">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close settings"
                  className="w-8 h-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* tabs */}
              <div className="flex gap-1 px-3 pt-3 shrink-0">
                {(['profile','settings'] as const).map(tab=>(
                  <button
                    key={tab}
                    onClick={()=>setActiveTab(tab)}
                    className={`flex-1 py-2.5 rounded-full font-mono text-xs font-bold tracking-wide transition-all cursor-pointer ${activeTab===tab ? 'bg-white text-[#1a120b]' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                  >
                    {tab==='profile' ? 'Profile' : 'Preferences'}
                  </button>
                ))}
              </div>

              {/* body */}
              <div className="overflow-y-auto px-6 py-6 space-y-6 flex-1 min-h-0">
                {activeTab==='profile' ? (
                  <form onSubmit={handleSave} className="space-y-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={pfp || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'player')}`}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full border-2 border-white/10 bg-white/5 object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-white/50">Signed in as</p>
                        <p className="font-mono text-sm font-bold text-white truncate">{user?.email ?? '—'}</p>
                        <p className="font-mono text-[11px] text-white/40 truncate">{user?.username || user?.name || 'Player'}</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="acc-pfp" className="block font-mono text-xs font-bold text-white/80 mb-1.5">Avatar URL</label>
                      <input
                        id="acc-pfp"
                        type="text"
                        value={pfp}
                        onChange={e=>setPfp(e.target.value)}
                        placeholder="https://..."
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c98a6e]/60"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="acc-name" className="font-mono text-xs font-bold text-white/80">Display Name</label>
                        <span className="font-mono text-[10px] text-white/30">{name.length}/50</span>
                      </div>
                      <input
                        id="acc-name"
                        type="text"
                        value={name}
                        onChange={e=>setName(e.target.value)}
                        placeholder="Your display name"
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c98a6e]/60"
                      />
                    </div>

                    <div>
                      <label htmlFor="acc-username" className="block font-mono text-xs font-bold text-white/80 mb-1.5">Username</label>
                      <input
                        id="acc-username"
                        type="text"
                        value={username}
                        onChange={e=>setUsername(e.target.value)}
                        placeholder="jasper_sona"
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c98a6e]/60"
                      />
                      <p className="mt-1 font-mono text-[11px] text-white/30">2–32 chars: letters, numbers, . _ -</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="acc-bio" className="font-mono text-xs font-bold text-white/80">Bio</label>
                        <span className="font-mono text-[10px] text-white/30">{bio.length}/500</span>
                      </div>
                      <textarea
                        id="acc-bio"
                        rows={3}
                        value={bio}
                        onChange={e=>setBio(e.target.value)}
                        placeholder="Tell the world something..."
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#c98a6e]/60 resize-none"
                      />
                    </div>

                    {err && <div role="alert" className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-mono text-xs">{err}</div>}
                    {msg && <div role="status" className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs">{msg}</div>}

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-3 rounded-xl bg-[#f4d5ad] text-[#1a120b] font-mono text-sm font-bold hover:bg-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>

                    <div className="pt-2 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-mono text-sm font-bold text-white">Local cache</p>
                          <p className="font-mono text-xs text-white/40">Clear your rarity cache in this browser</p>
                        </div>
                        <button type="button" onClick={handleClearCache} className="px-4 py-2 rounded-full bg-white/10 border border-white/10 font-mono text-xs font-bold text-white hover:bg-white/15 transition-colors cursor-pointer">Clear Cache</button>
                      </div>
                      {dataMsg && <p className="font-mono text-xs text-emerald-400">{dataMsg}</p>}
                      <button type="button" onClick={handleLogout} className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-sm font-bold transition-colors cursor-pointer">Log Out</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                      <h3 className="font-sans font-bold text-white mb-1">Appearance</h3>
                      <div className="divide-y divide-white/10">
                        <ToggleRow label="Reduce motion" description="Shorten the reel spin" checked={settings.reduceMotion} onChange={v=>setSetting('reduceMotion', v)} />
                        <ToggleRow label="Sound effects" description="Whoosh + rarity chime" checked={settings.soundEnabled} onChange={v=>setSetting('soundEnabled', v)} />
                        <ToggleRow label="Achievement toasts" description="Pop a toast on unlock" checked={settings.achievementToasts} onChange={v=>setSetting('achievementToasts', v)} />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
                      <h3 className="font-sans font-bold text-white mb-1">Collection</h3>
                      <div className="divide-y divide-white/10">
                        <ToggleRow label="Compact grid" description="Denser rarity cells" checked={settings.compactGrid} onChange={v=>setSetting('compactGrid', v)} />
                        <ToggleRow label="Show rarity names" description="Name under each number" checked={settings.showRarityNames} onChange={v=>setSetting('showRarityNames', v)} />
                      </div>
                    </div>
                    <p className="text-center font-mono text-[11px] text-white/25 pt-2">Settings save automatically</p>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountSettingsModal;

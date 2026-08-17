import { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setEmail('');
  };

  return (
    <footer className="p-10 border-t border-primary/20 text-center font-typewriter text-primary bg-secondary/5">
      <div className="max-w-md mx-auto mb-8">
        <p className="font-mono text-sm mb-4">Subscribe for updates & drops</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 p-2 rounded bg-bg border border-primary/30 text-primary font-mono text-sm focus:outline-none focus:border-accent"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-bg font-mono rounded text-sm hover:bg-darker transition-colors cursor-pointer"
          >
            Join
          </button>
        </form>
        {status === 'success' && <p className="text-green-700 font-mono text-xs mt-2">Successfully subscribed!</p>}
        {status === 'error' && <p className="text-red-700 font-mono text-xs mt-2">Please enter a valid email address.</p>}
      </div>

      <div className="flex justify-center gap-6 mb-4 font-sans">
        <a href="#" className="hover:underline">Terms and Conditions</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
      </div>
      <p className="mb-2">&copy; {new Date().getFullYear()} Jasper Sona. All rights reserved.</p>
      <p className="text-xs font-mono text-primary/60">Last updated: August 16, 2026</p>
    </footer>
  );
};

export default Footer;

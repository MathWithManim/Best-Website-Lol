import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import DarkModeToggle from "./DarkModeToggle";

interface AuthModalProps {
  onLogin: (email: string) => void;
}

const AuthModal = ({ onLogin }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation(api.users.login);
  const signupMutation = useMutation(api.users.signup);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email/username and password.");
      return;
    }

    const userEmail = email.trim();

    try {
      if (isLogin) {
        await loginMutation({ email: userEmail, password });
      } else {
        await signupMutation({
          email: userEmail,
          username: username || userEmail.split("@")[0],
          password,
        });
      }

      const storedAccounts = JSON.parse(localStorage.getItem("savedAccounts") || "[]");
      if (!storedAccounts.includes(userEmail)) {
        storedAccounts.push(userEmail);
        localStorage.setItem("savedAccounts", JSON.stringify(storedAccounts));
      }
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", userEmail);

      onLogin(userEmail);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Something went wrong";
      if (raw.includes("Invalid email or password")) {
        setError("Wrong email or password. Try again.");
      } else if (raw.includes("already exists")) {
        setError("Account already exists. Try logging in instead.");
      } else {
        setError("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-bg/95 dark:bg-[#1a120b]/95 flex flex-col items-center justify-center z-50 p-6">
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 dark:bg-[#2d1e14]/90 border border-primary/20 dark:border-[#f4d5ad]/30 p-8 rounded-2xl max-w-md w-full relative shadow-2xl"
      >
        <h2 className="text-3xl font-bold font-sans text-primary dark:text-[#f4d5ad] mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 font-mono text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block font-mono text-sm text-primary dark:text-[#f4d5ad] mb-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-bg dark:bg-[#1a120b] border border-primary/30 dark:border-[#f4d5ad]/30 text-primary dark:text-[#f4d5ad] font-mono focus:outline-none focus:border-accent"
                placeholder="jasper_sona"
              />
            </div>
          )}
          <div>
            <label className="block font-mono text-sm text-primary dark:text-[#f4d5ad] mb-1">Email / Root</label>
            <input 
              type="text" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#1a120b] border border-primary/30 dark:border-[#f4d5ad]/30 text-primary dark:text-[#f4d5ad] font-mono focus:outline-none focus:border-accent"
              placeholder="root@root.root"
            />
          </div>
          <div>
            <label className="block font-mono text-sm text-primary dark:text-[#f4d5ad] mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#1a120b] border border-primary/30 dark:border-[#f4d5ad]/30 text-primary dark:text-[#f4d5ad] font-mono focus:outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg hover:opacity-95 transition-opacity font-bold mt-2 cursor-pointer"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Floating Squircle Toggle at the bottom */}
        <div className="mt-8 flex justify-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="w-16 h-16 rounded-2xl bg-accent text-bg flex items-center justify-center font-mono text-xs shadow-lg hover:scale-105 transition-transform cursor-pointer"
            title="Toggle Login / Signup"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;

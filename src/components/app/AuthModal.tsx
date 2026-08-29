import { useState } from "react";
import { m } from "framer-motion";
import { authClient } from "../../lib/auth-client";

interface AuthModalProps {
  onLogin?: (email: string) => void;
}

const AuthModal = ({ onLogin }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const userEmail = email.trim();
    const userName = username.trim();
    // Precise client-side validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    if (!userEmail || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!emailOk) {
      setError(`Invalid email: "${userEmail}" — expected format name@domain.tld`);
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError(`Password too short (${password.length}/8 chars) — use at least 8 characters.`);
      return;
    }
    if (mode === "signup" && userName && !/^[a-zA-Z0-9._-]{2,32}$/.test(userName)) {
      setError(`Invalid username "${userName}" — use 2-32 letters/numbers/._- only.`);
      return;
    }

    setSubmitting(true);
    try {
      let result;
      if (mode === "login") {
        result = await authClient.signIn.email({ email: userEmail, password });
      } else {
        result = await authClient.signUp.email({
          email: userEmail,
          password,
          name: userName || userEmail.split("@")[0],
        });
      }

      if (result.error) throw result.error;

      // Neon Auth with "Require email verification" ON returns success but no session (token null)
      // Detect it and surface a helpful message instead of silently bouncing back to AuthModal
      const data: any = (result as any)?.data;
      const needsVerification = mode === "signup" && data?.user && (data?.token === null || data?.user?.emailVerified === false) && !data?.session;
      // If verification needed, treat as soft-success: switch to login with instructions
      if (needsVerification) {
        setError(`Account created for ${userEmail} — check your email to verify, then log in. (If you don't see it, check spam. Or ask admin to disable 'Require email verification' in Neon Auth dashboard for instant login.)`);
        setMode("login");
        setSubmitting(false);
        return;
      }

      const storedAccounts = JSON.parse(localStorage.getItem("savedAccounts:v1") || "[]");
      if (!storedAccounts.includes(userEmail)) {
        storedAccounts.push(userEmail);
        localStorage.setItem("savedAccounts:v1", JSON.stringify(storedAccounts));
      }

      onLogin?.(userEmail);
    } catch (err: unknown) {
      // Verbose extraction — better-auth errors are often {message, code} or nested {error: {message}}
      const e: any = err;
      const raw = e?.message
        || e?.error?.message
        || e?.body?.message
        || e?.cause?.message
        || (typeof e === "string" ? e : null)
        || (e ? JSON.stringify(e).slice(0, 400) : null)
        || "Unknown error";
      const code = e?.code || e?.error?.code || e?.body?.code || "";
      const status = e?.status || e?.statusCode || "";
      console.error("[AuthModal] signUp/signIn failed:", { err, raw, code, status, email: userEmail });

      const lower = raw.toLowerCase();
      let msg = code ? `${raw} (${code})` : raw;
      if (status) msg += ` [${status}]`;
      // Make common cases precise but keep original detail
      if (lower.includes("already exists") || lower.includes("duplicate") || lower.includes("account")) {
        msg = `Account already exists for ${userEmail} — try logging in instead. (${raw})`;
        if (mode === "signup") setMode("login");
      } else if (lower.includes("email_not_verified") || (lower.includes("email") && lower.includes("not verified")) || lower.includes("verify your email")) {
        msg = `Account created for ${userEmail} — check your email to verify, then log in. (If you don't see it, check spam. You can also ask admin to disable 'Require email verification' in Neon Auth dashboard.)`;
        if (mode === "signup") setMode("login");
      } else if (lower.includes("password") && lower.includes("short")) {
        msg = `Password too weak: ${raw}`;
      } else if (lower.includes("invalid") && lower.includes("email")) {
        msg = `Invalid email: ${raw}`;
      } else if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) {
        msg = `Network error — cannot reach auth server (${raw}). Check VITE_NEON_AUTH_URL / NEON_AUTH_URL and try again.`;
      } else if (lower.includes("rate") || lower.includes("too many")) {
        msg = `Rate limited: ${raw} — wait a moment and retry.`;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg/95 dark:bg-[#1a120b]/95 flex flex-col items-center justify-center z-50 p-6">
      <m.div 
        key={mode}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 dark:bg-[#2d1e14]/90 border border-primary/20 dark:border-[#f4d5ad]/30 p-8 rounded-2xl max-w-md w-full relative shadow-2xl"
      >
        <h2 className="text-3xl font-bold font-sans text-primary dark:text-[#f4d5ad] mb-6 text-center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        
        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 font-mono text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === "signup" && (
            <div>
              <label htmlFor="auth-username" className="block font-mono text-sm text-primary dark:text-[#f4d5ad] mb-1">Username</label>
              <input 
                id="auth-username"
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-bg dark:bg-[#1a120b] border border-primary/30 dark:border-[#f4d5ad]/30 text-primary dark:text-[#f4d5ad] font-mono focus:outline-none focus:border-accent"
                placeholder="jasper_sona"
                aria-describedby={mode === "signup" ? "auth-username-hint" : undefined}
              />
              <p id="auth-username-hint" className="sr-only">Choose a display name for your profile</p>
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="block font-mono text-sm text-primary dark:text-[#f4d5ad] mb-1">Email</label>
            <input 
              id="auth-email"
              type="text"
              autoFocus 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg dark:bg-[#1a120b] border border-primary/30 dark:border-[#f4d5ad]/30 text-primary dark:text-[#f4d5ad] font-mono focus:outline-none focus:border-accent"
              placeholder="youremail@amazing.com"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="block font-mono text-sm text-primary dark:text-[#f4d5ad] mb-1">Password</label>
            <div className="relative">
              <input 
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-10 rounded-lg bg-bg dark:bg-[#1a120b] border border-primary/30 dark:border-[#f4d5ad]/30 text-primary dark:text-[#f4d5ad] font-mono focus:outline-none focus:border-accent"
                placeholder="••••••••"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-[#f4d5ad]/40 hover:text-primary dark:hover:text-[#f4d5ad] transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg hover:opacity-95 transition-opacity font-bold mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Login" : "Sign Up")}
          </button>
        </form>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            title={mode === "login" ? "Create a new account" : "Log in to an existing account"}
            className="font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60 hover:text-accent dark:hover:text-[#c98a6e] transition-colors cursor-pointer"
          >
            {mode === "login" ? "New here? Sign up →" : "Already have an account? Log in →"}
          </button>
        </div>
      </m.div>
    </div>
  );
};

export default AuthModal;
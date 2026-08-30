import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import gsap from "gsap";
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
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // captcha / bot check (replaces email verification)
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState<string[]>(["", "", "", "", "", ""]);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [pendingSignup, setPendingSignup] = useState<{ email: string; name: string; password: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const loaderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement | null>(null);

  const genCode = () => {
    const c = Math.floor(100000 + Math.random() * 900000).toString();
    setCaptchaCode(c);
    return c;
  };

  // animate pill in
  useEffect(() => {
    if (showCaptcha && pillRef.current) {
      gsap.fromTo(pillRef.current, { y: 80, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" });
    }
  }, [showCaptcha]);

  // focus first box when captcha appears
  useEffect(() => {
    if (showCaptcha) {
      setTimeout(() => inputRefs.current[0]?.focus(), 120);
    }
  }, [showCaptcha]);

  const triggerLoader = (idx: number) => {
    const el = loaderRefs.current[idx];
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.set(el, { xPercent: -100, opacity: 1 });
    gsap.to(el, { xPercent: 100, duration: 0.55, ease: "power2.inOut", onComplete: () => gsap.set(el, { opacity: 0 }) });
    // also flash the box border green briefly
    const box = el.parentElement;
    if (box) {
      gsap.fromTo(box, { borderColor: "rgba(16,185,129,0.9)" }, { borderColor: "rgba(16,185,129,0.25)", duration: 0.6, ease: "power1.out" });
    }
  };

  const performSignup = async (data: { email: string; name: string; password: string }) => {
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const result = await authClient.signUp.email({ email: data.email, password: data.password, name: data.name });
      if ((result as any)?.error) throw (result as any).error;
      const d: any = (result as any)?.data;
      const needsVerification = d?.user && (d?.token === null || d?.user?.emailVerified === false) && !d?.session;
      if (needsVerification) {
        // not an error — show as popup, reserve red for real errors
        setInfo(`Account created for ${data.email} — check your email to verify, then log in.`);
        setMode("login");
        setShowCaptcha(false);
        setPendingSignup(null);
        return;
      }
      const storedAccounts = JSON.parse(localStorage.getItem("savedAccounts:v1") || "[]");
      if (!storedAccounts.includes(data.email)) {
        storedAccounts.push(data.email);
        localStorage.setItem("savedAccounts:v1", JSON.stringify(storedAccounts));
      }
      onLogin?.(data.email);
    } catch (err: unknown) {
      const e: any = err;
      const raw = e?.message || e?.error?.message || e?.body?.message || e?.cause?.message || (typeof e === "string" ? e : null) || (e ? JSON.stringify(e).slice(0, 400) : null) || "Unknown error";
      const code = e?.code || e?.error?.code || e?.body?.code || "";
      const status = e?.status || e?.statusCode || "";
      console.error("[AuthModal] signUp failed:", { err, raw, code, status, email: data.email });
      const lower = raw.toLowerCase();
      let msg = code ? `${raw} (${code})` : raw;
      if (status) msg += ` [${status}]`;
      if (lower.includes("already exists") || lower.includes("duplicate")) {
        msg = `Account already exists for ${data.email} — try logging in instead.`;
        setMode("login");
        setShowCaptcha(false);
      } else if (lower.includes("password") && lower.includes("short")) msg = `Password too weak: ${raw}`;
      else if (lower.includes("invalid") && lower.includes("email")) msg = `Invalid email: ${raw}`;
      else if (lower.includes("network") || lower.includes("fetch") || lower.includes("failed to fetch")) msg = `Network error — cannot reach auth server (${raw}).`;
      else if (lower.includes("rate") || lower.includes("too many")) msg = `Rate limited: ${raw} — wait a moment.`;
      setError(msg);
      // keep captcha open so they can retry? close it to let them edit
      setShowCaptcha(false);
      setPendingSignup(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setCaptchaError(null);

    const userEmail = email.trim();
    const userName = username.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail);
    if (!userEmail || !password) { setError("Please enter both email and password."); return; }
    if (!emailOk) { setError(`Invalid email: "${userEmail}" — expected format name@domain.tld`); return; }
    if (mode === "signup" && password.length < 8) { setError(`Password too short (${password.length}/8 chars) — use at least 8 characters.`); return; }
    if (mode === "signup" && userName && !/^[a-zA-Z0-9._-]{2,32}$/.test(userName)) { setError(`Invalid username "${userName}" — use 2-32 letters/numbers/._- only.`); return; }

    if (mode === "login") {
      setSubmitting(true);
      try {
        const result = await authClient.signIn.email({ email: userEmail, password });
        if ((result as any)?.error) throw (result as any).error;
        const storedAccounts = JSON.parse(localStorage.getItem("savedAccounts:v1") || "[]");
        if (!storedAccounts.includes(userEmail)) { storedAccounts.push(userEmail); localStorage.setItem("savedAccounts:v1", JSON.stringify(storedAccounts)); }
        onLogin?.(userEmail);
      } catch (err: unknown) {
        const e: any = err;
        const raw = e?.message || e?.error?.message || e?.body?.message || (typeof e === "string" ? e : null) || "Unknown error";
        const code = e?.code || "";
        const status = e?.status || "";
        let msg = code ? `${raw} (${code})` : raw;
        if (status) msg += ` [${status}]`;
        if (raw.toLowerCase().includes("email_not_verified") || raw.toLowerCase().includes("not verified")) msg = `Email not verified — check your inbox for the verification link.`;
        setError(msg);
      } finally { setSubmitting(false); }
      return;
    }

    // signup -> show 6-digit bot check pill first
    const pending = { email: userEmail, name: userName || userEmail.split("@")[0], password };
    setPendingSignup(pending);
    genCode();
    setCaptchaInput(["", "", "", "", "", ""]);
    setCaptchaError(null);
    setShowCaptcha(true);
  };

  const handleCaptchaChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...captchaInput];
    next[idx] = digit;
    setCaptchaInput(next);
    if (digit) triggerLoader(idx);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
    // check completion
    const combined = next.join("");
    if (combined.length === 6) {
      const expected = captchaCode;
      if (combined === expected) {
        setCaptchaError(null);
        // success: green burst on all boxes
        loaderRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.set(el, { xPercent: -100, opacity: 1, backgroundColor: "rgb(16 185 129)" });
          gsap.to(el, { xPercent: 100, duration: 0.45, delay: i * 0.04, ease: "power2.inOut", onComplete: () => gsap.set(el, { opacity: 0 }) });
        });
        // pill success pulse
        if (pillRef.current) gsap.fromTo(pillRef.current, { scale: 1 }, { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" });
        setTimeout(() => {
          if (pendingSignup) performSignup(pendingSignup);
        }, 420);
      } else {
        setCaptchaError("Code didn't match — try again");
        if (pillRef.current) {
          gsap.fromTo(pillRef.current, { x: 0 }, { x: -8, duration: 0.07, repeat: 5, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(pillRef.current, { x: 0 }) });
        }
        // red flash
        pillRef.current?.querySelectorAll("[data-box]").forEach((b) => {
          gsap.fromTo(b, { borderColor: "rgba(239,68,68,0.9)" }, { borderColor: "rgba(244,213,173,0.30)", duration: 0.5 });
        });
        setTimeout(() => {
          setCaptchaInput(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 700);
      }
    }
  };

  const handleCaptchaKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !captchaInput[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      const arr = pasted.split("");
      setCaptchaInput(arr);
      arr.forEach((_, i) => triggerLoader(i));
      if (pasted === captchaCode) {
        setTimeout(() => pendingSignup && performSignup(pendingSignup), 420);
      } else {
        setCaptchaError("Code didn't match — try again");
        setTimeout(() => { setCaptchaInput(["", "", "", "", "", ""]); inputRefs.current[0]?.focus(); }, 700);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-bg/95 dark:bg-[#1a120b]/95 flex flex-col items-center justify-center z-50 p-6">
      {/* info popup — non-red, for verification / soft success */}
      <AnimatePresence>
        {info && (
          <m.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%] sm:w-full px-4">
            <div className="bg-emerald-500/95 dark:bg-emerald-600/95 text-white font-mono text-sm rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3 border border-emerald-400/30">
              <span className="text-base leading-none mt-0.5">✓</span>
              <span className="flex-1">{info}</span>
              <button onClick={() => setInfo(null)} className="ml-2 -mr-1 -my-1 p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white" aria-label="Dismiss">✕</button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <m.div
        key={mode}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 dark:bg-[#2d1e14]/90 border border-primary/20 dark:border-[#f4d5ad]/30 p-8 rounded-2xl max-w-md w-full relative shadow-2xl"
      >
        <h2 className="text-3xl font-bold font-sans text-primary dark:text-[#f4d5ad] mb-6 text-center">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        {/* only real errors use red */}
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
                name="username"
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
              name="email"
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
                name="password"
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
            disabled={submitting || showCaptcha}
            className="w-full py-3 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono rounded-lg hover:opacity-95 transition-opacity font-bold mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (mode === "login" ? "Logging in..." : "Creating account...") : showCaptcha ? "Verify to continue…" : (mode === "login" ? "Login" : "Sign Up")}
          </button>
        </form>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); setShowCaptcha(false); }}
            title={mode === "login" ? "Create a new account" : "Log in to an existing account"}
            className="font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60 hover:text-accent dark:hover:text-[#c98a6e] transition-colors cursor-pointer"
          >
            {mode === "login" ? "New here? Sign up →" : "Already have an account? Log in →"}
          </button>
        </div>
      </m.div>

      {/* bottom pill — 6-digit human check */}
      <AnimatePresence>
        {showCaptcha && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end justify-center pb-6 px-4 pointer-events-none"
          >
            <div ref={pillRef} className="pointer-events-auto w-full max-w-[420px] bg-white dark:bg-[#2d1e14] border border-primary/15 dark:border-[#f4d5ad]/20 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-primary/60 dark:text-[#f4d5ad]/60">Human check</p>
                  <p className="font-mono text-sm text-primary dark:text-[#f4d5ad] mt-1">Type the number below to confirm</p>
                  <div className="mt-2 inline-flex items-center gap-2 bg-bg dark:bg-[#1a120b] border border-primary/15 dark:border-[#f4d5ad]/15 rounded-full px-3 py-1.5">
                    <span className="font-mono text-[11px] text-primary/50 dark:text-[#f4d5ad]/50 tracking-widest">CODE</span>
                    <span className="font-mono text-lg font-bold tracking-[0.18em] text-primary dark:text-[#f4d5ad]">{captchaCode}</span>
                    <button onClick={() => { genCode(); setCaptchaInput(["", "", "", "", "", ""]); setCaptchaError(null); inputRefs.current[0]?.focus(); }} className="ml-1 p-1 rounded-full hover:bg-primary/10 dark:hover:bg-[#f4d5ad]/10 transition-colors" title="New code" aria-label="New code">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary/60 dark:text-[#f4d5ad]/60"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>
                    </button>
                  </div>
                </div>
                <button onClick={() => { setShowCaptcha(false); setPendingSignup(null); setCaptchaInput(["", "", "", "", "", ""]); setCaptchaError(null); }} className="shrink-0 mt-1 p-2 rounded-full bg-primary/10 dark:bg-[#f4d5ad]/10 hover:bg-primary/15 transition-colors" aria-label="Close">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/70 dark:text-[#f4d5ad]/70"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {[0,1,2,3,4,5].map((i) => (
                  <div key={i} data-box className="relative w-[52px] h-[56px] sm:w-[56px] sm:h-[60px] rounded-2xl bg-bg dark:bg-[#1a120b] border-2 border-primary/15 dark:border-[#f4d5ad]/15 flex items-center justify-center overflow-hidden focus-within:border-emerald-500/60 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.18)] transition-colors">
                    {/* green loader sweep */}
                    <div ref={(el) => { loaderRefs.current[i] = el; }} className="absolute inset-0 opacity-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.95) 50%, transparent)", transform: "translateX(-100%)" }} />
                    <input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      name={`captcha-${i}`}
                      value={captchaInput[i]}
                      onChange={(e) => handleCaptchaChange(i, e.target.value)}
                      onKeyDown={(e) => handleCaptchaKeyDown(i, e)}
                      className="relative z-10 w-full h-full bg-transparent text-center font-mono text-xl font-bold text-primary dark:text-[#f4d5ad] focus:outline-none caret-transparent"
                      aria-label={`Digit ${i+1}`}
                    />
                    {/* filled dot */}
                    {captchaInput[i] && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500/70" />}
                  </div>
                ))}
              </div>

              {captchaError ? (
                <p role="alert" className="mt-3 text-center font-mono text-xs text-red-600 dark:text-red-400">{captchaError}</p>
              ) : (
                <p className="mt-3 text-center font-mono text-[11px] text-primary/45 dark:text-[#f4d5ad]/45">Enter the 6 digits exactly as shown</p>
              )}

              {submitting && <p className="mt-2 text-center font-mono text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">Verifying…</p>}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthModal;

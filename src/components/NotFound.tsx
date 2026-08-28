import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import lottie from 'lottie-web';

const NotFound = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
        progressiveLoad: true,
      },
      path: '/lottie/404-12-8.json',
    });
    animRef.current = anim;
    return () => anim.destroy();
  }, []);

  useEffect(() => {
    document.title = '404 — Lost in Saturn — Jasper Sona';
    return () => { document.title = 'Jasper Sona'; };
  }, []);

  const toggle = () => {
    if (!animRef.current) return;
    if (animRef.current.isPaused) {
      animRef.current.play();
      setPaused(false);
    } else {
      animRef.current.pause();
      setPaused(true);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#020208] text-[#f4d5ad] flex flex-col overflow-hidden relative">
      {/* ambient wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_30%,rgba(224,159,88,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(244,213,173,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(244,213,173,0.4) 1px, transparent 1px)`, backgroundSize: '56px 56px' }} />

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-8 py-5">
        <Link to="/" className="font-typewriter text-sm tracking-[0.2em] text-[#f4d5ad]/60 hover:text-[#f4d5ad] transition-colors">
          JASPER SONA
        </Link>
        <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#f4d5ad]/35">Error 404 — Saturn drift</span>
      </div>

      {/* BIG LOTTIE - fits */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 pb-6 min-h-0">
        <div
          ref={containerRef}
          className="w-[min(100vw-2rem,177.78vh)] h-[min(62vh,56.25vw)] md:h-[min(68vh,56.25vw)] max-w-[1880px] max-h-[1080px] shrink-0"
          aria-label="404 Saturn Lottie animation"
          role="img"
        />

        <div className="mt-6 md:mt-8 text-center max-w-xl">
          <h1 className="font-[Geist,sans-serif] text-2xl md:text-3xl font-bold tracking-tight text-[#f4d5ad]">Lost in orbit</h1>
          <p className="mt-2 font-mono text-sm text-[#f4d5ad]/60 leading-relaxed">
            This page drifted off like Saturn&apos;s ring. The signal is gone — let&apos;s get you back.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#f4d5ad] text-[#1a120b] font-mono text-sm font-bold shadow-[0_8px_24px_rgba(244,213,173,0.25)] hover:translate-y-[-1px] transition-transform"
          >
            Return to Home <span aria-hidden>→</span>
          </Link>
          <Link
            to="/rng"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/10 backdrop-blur border border-white/15 text-[#f4d5ad] font-mono text-sm font-bold hover:bg-white/15 transition-colors"
          >
            Play RNG
          </Link>
          <button
            onClick={toggle}
            className="inline-flex items-center px-5 py-3 rounded-full bg-transparent border border-white/10 text-[#f4d5ad]/70 font-mono text-xs tracking-wide hover:text-[#f4d5ad] hover:border-white/20 transition-colors"
          >
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>

        <p className="mt-4 font-mono text-[11px] tracking-wide text-[#f4d5ad]/30">
          1880×1080 · 48fps · loop · press space to pause
        </p>
      </div>

      {/* subtle footer */}
      <div className="relative z-10 px-6 py-4 flex items-center justify-center gap-4 font-mono text-[11px] text-[#f4d5ad]/25">
        <span>404 · 12-8 · SATURN</span>
        <span className="w-px h-3 bg-white/15" />
        <a href="/lottie/404-12-8.json" download className="hover:text-[#f4d5ad]/60 underline underline-offset-4">JSON</a>
        <a href="https://finsweet.com/lottieflow/download/404-12-8" target="_blank" rel="noopener" className="hover:text-[#f4d5ad]/60 underline underline-offset-4">source</a>
      </div>
    </div>
  );
};

export default NotFound;

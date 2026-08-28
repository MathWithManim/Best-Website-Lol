import { useRef } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { INTRO, TAGLINE } from "../../lib/portfolio";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSettings } from "../../lib/settings";

gsap.registerPlugin(ScrollTrigger);

const DiceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="h-4 w-4 shrink-0"
  >
    <rect width="18" height="18" x="3" y="3" rx="4" ry="4" />
    <path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" />
  </svg>
);

const Hero = () => {
  const rootRef = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  const reduce = settings.reduceMotion;

  useGSAP(
    () => {
      if (reduce || !rootRef.current) return;

      const ctx = gsap.context(() => {
        // Title char stagger - kinetic reveal
        gsap.from(".hero-char", {
          y: 110,
          rotateX: -35,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.035,
          delay: 0.15,
        });

        // Tagline line reveal
        gsap.from(".hero-tagline", {
          y: 24,
          opacity: 0,
          filter: "blur(6px)",
          duration: 0.8,
          ease: "power3.out",
          delay: 0.9,
        });

        gsap.from(".hero-intro", {
          y: 16,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          delay: 1.05,
        });

        gsap.from(".hero-cta", {
          y: 22,
          opacity: 0,
          scale: 0.96,
          duration: 0.7,
          ease: "back.out(1.4)",
          stagger: 0.08,
          delay: 1.2,
        });

        // Parallax on scroll - hero gradient
        gsap.to(".hero-glow", {
          yPercent: 22,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        // Floating accent orb
        gsap.to(".hero-orb", {
          y: -14,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }, rootRef);

      return () => ctx.revert();
    },
    { scope: rootRef, dependencies: [reduce] }
  );

  // Magnetic hover for CTAs
  const handleMagnetic = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduce) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.18, y: y * 0.28, duration: 0.4, ease: "power3.out" });
  };
  const resetMagnetic = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  const title = "Jasper";
  const titleAccent = "Sona";

  return (
    <section
      ref={rootRef}
      className="relative flex flex-col items-center justify-center min-h-[72vh] md:min-h-[88vh] md:h-[calc(100vh-80px)] p-6 overflow-hidden bg-[#F5E6CA] dark:bg-[#0a0a0c] isolate"
    >
      {/* Ambient glow + grid */}
      <div className="hero-glow pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e09f58]/[0.06] via-transparent to-transparent dark:from-[#e09f58]/[0.09]" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(224,159,88,0.18),transparent_68%)] blur-[28px] dark:bg-[radial-gradient(ellipse_at_center,rgba(224,159,88,0.14),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(139,69,19,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,69,19,0.45) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Floating orb */}
      <div
        aria-hidden="true"
        className="hero-orb pointer-events-none absolute -top-6 right-[18%] w-28 h-28 md:w-40 md:h-40 rounded-full opacity-60 blur-[1px]"
        style={{
          background: "radial-gradient(circle at 35% 30%, #ffd9a8 0%, #e09f58 42%, #8B4513 100%)",
          boxShadow: "0 18px 60px rgba(224,159,88,0.45), inset 0 2px 12px rgba(255,255,255,0.55)",
        }}
      />

      {/* Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:mix-blend-soft-light dark:opacity-[0.055]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center max-w-6xl mx-auto px-2 md:px-10">
        {/* Title with char split */}
        <h1 className="font-[Geist,sans-serif] text-[2.8rem] md:text-7xl lg:text-[5.8rem] font-[600] tracking-[-0.045em] leading-[0.92] text-[#1a120b] dark:text-[#f4d5ad] select-none">
          <span className="inline-flex items-baseline overflow-hidden py-1 gap-[0.18em]">
            <span className="inline-block">
              {title.split("").map((ch, i) => (
                <span key={i} className="hero-char inline-block will-change-transform" style={{ transformOrigin: "50% 100%" }}>
                  {ch}
                </span>
              ))}
            </span>
            <span className="text-[#A0522D] dark:text-[#e09f58] inline-block">
              {titleAccent.split("").map((ch, i) => (
                <span
                  key={i}
                  className="hero-char inline-block will-change-transform"
                  style={{ transformOrigin: "50% 100%" }}
                >
                  {ch}
                </span>
              ))}
            </span>
          </span>
        </h1>

        <div className="hero-tagline mt-5 md:mt-7 inline-flex flex-wrap items-center justify-center gap-3 text-[1.05rem] md:text-3xl lg:text-[2rem] font-mono text-[#1a120b]/72 dark:text-[#f4d5ad]/80 tracking-tight leading-none">
          <span>the RNG game that actually ships</span>
        </div>
      </div>

      <p className="hero-tagline relative mt-3 mx-auto font-mono text-sm md:text-base font-bold text-[#A0522D] dark:text-[#e09f58] text-center tracking-wide">
        {TAGLINE}
      </p>
      <p className="hero-intro relative mt-2 max-w-[36rem] mx-auto font-mono text-xs md:text-[13px] text-[#8B4513]/65 dark:text-[#f4d5ad]/60 text-center leading-relaxed px-4">
        {INTRO}
      </p>

      <div className="relative mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
        <Link
          to="/rng"
          onMouseMove={handleMagnetic}
          onMouseLeave={resetMagnetic}
          title="Play the RNG game"
          className="hero-cta group inline-flex items-center gap-2.5 px-7 md:px-8 py-3 md:py-[13px] bg-[#1a120b] dark:bg-[#f4d5ad] text-[#f4d5ad] dark:text-[#1a120b] font-mono text-sm font-bold rounded-full shadow-[0_10px_36px_rgba(26,18,11,0.28),0_0_0_1px_rgba(224,159,88,0.18)] dark:shadow-[0_10px_36px_rgba(0,0,0,0.45)] hover:shadow-[0_14px_44px_rgba(224,159,88,0.28)] will-change-transform transition-shadow duration-300"
        >
          <span className="grid place-items-center w-7 h-7 rounded-full bg-[#e09f58] text-[#1a120b] group-hover:rotate-[14deg] transition-transform duration-300">
            <DiceIcon />
          </span>
          Play RNG
          <span className="opacity-60 group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
        <a
          href="#contact"
          onMouseMove={handleMagnetic}
          onMouseLeave={resetMagnetic}
          className="hero-cta inline-flex items-center px-7 md:px-8 py-3 md:py-[13px] bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl border border-[#8B4513]/14 dark:border-white/12 text-[#1a120b] dark:text-[#f4d5ad] font-mono text-sm font-bold rounded-full hover:bg-white dark:hover:bg-white/[0.12] hover:border-[#e09f58]/30 shadow-[0_8px_24px_rgba(139,69,19,0.08)] will-change-transform transition-all duration-300"
          title="Jump to contact"
        >
          Get in Touch
        </a>
      </div>

      {/* Scroll hint */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[#8B4513]/40 dark:text-[#f4d5ad]/35"
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <span className="w-[1px] h-10 bg-gradient-to-b from-current to-transparent opacity-60" />
      </m.div>
    </section>
  );
};

export default Hero;
export { DiceIcon };

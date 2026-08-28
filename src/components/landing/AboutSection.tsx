import { useRef } from 'react';
import { m } from 'framer-motion';
import { ABOUT_PARAGRAPHS, FACTS } from '../../lib/portfolio';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSettings } from '../../lib/settings';
gsap.registerPlugin(ScrollTrigger);
const AboutSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  useGSAP(
    () => {
      if (settings.reduceMotion || !ref.current) return;
      const ctx = gsap.context(() => {
        gsap.from('.about-card', {
          y: 42,
          opacity: 0,
          scale: 0.985,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-card',
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
        gsap.from('.about-fact', {
          x: 18,
          opacity: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: '.about-facts',
            start: 'top 86%',
            toggleActions: 'play none none reverse',
          },
        });
        // SPAM: word-by-word scrub
        gsap.from('.about-word', {
          opacity: 0.12,
          y: 10,
          filter: 'blur(3px)',
          stagger: 0.02,
          ease: 'none',
          scrollTrigger: {
            trigger: '.about-words',
            start: 'top 80%',
            end: 'bottom 55%',
            scrub: 0.9,
          },
        });
        // SPAM: border draw
        gsap.from('.about-border', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-card',
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        });
        // SPAM: subtle card tilt on scrub + skew on scroll
        gsap.to('.about-card', {
          yPercent: -2,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
        gsap.to('.about-card', {
          skewY: 0.12,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 70%',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
        // SPAM: facts glow pulse stagger
        gsap.from('.about-fact', {
          backgroundColor: 'rgba(224,159,88,0.0)',
          duration: 0.6,
          stagger: 0.06,
          delay: 0.3,
          scrollTrigger: {
            trigger: '.about-facts',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        });
        // SPAM: image parallax if any
        gsap.to('.about-orb', {
          y: -18,
          x: 10,
          rotate: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }, ref);
      return () => ctx.revert();
    },
    { scope: ref, dependencies: [settings.reduceMotion] }
  );

  return (
    <section ref={ref} id="about" className="p-6 md:p-10 max-w-5xl mx-auto scroll-mt-20 text-center overflow-hidden">
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="font-mono text-xs text-accent mb-2 tracking-widest text-center"
      >
        {'//'} who
      </m.p>
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary tracking-tight text-center"
      >
        About
      </m.h2>
      <div className="about-card relative text-left bg-white/70 dark:bg-[#1e160f]/55 backdrop-blur-xl border border-[#f4d5ad]/20 dark:border-white/10 rounded-[22px] overflow-hidden shadow-[0_16px_48px_rgba(139,69,19,0.12),0_0_0_1px_rgba(139,69,19,0.08)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.28)] will-change-transform">
        {/* Top glow */}
        <div className="about-border absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e09f58]/40 to-transparent will-change-transform" />
        <div className="about-orb absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(224,159,88,0.16),transparent_70%)] blur-[18px] pointer-events-none" />
        <div className="flex items-center justify-between gap-4 px-5 md:px-7 py-3 border-b border-[#f4d5ad]/16 dark:border-white/10 bg-[#f4d5ad]/[0.06] dark:bg-white/[0.04]">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8B4513]/60 dark:text-[#f4d5ad]/60">Dossier — 001</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent rotate-[-1.2deg] border border-accent/50 rounded-full px-2.5 py-1 bg-accent/10">Subject: Jasper Sona</span>
        </div>
        <div className="p-5 md:p-7 md:flex md:gap-10">
          <div className="md:w-2/3">
            {ABOUT_PARAGRAPHS.map((p, i) => (
              <m.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="about-words font-mono text-sm md:text-[15px] text-[#1a120b]/70 dark:text-[#f4d5ad]/75 leading-relaxed mb-4 last:mb-0 flex flex-wrap gap-x-[0.32em]"
              >
                {p.split(' ').map((w, wi) => (
                  <span key={wi} className="about-word inline-block will-change-transform">{w}</span>
                ))}
              </m.p>
            ))}
            <m.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="font-cursive italic text-3xl text-accent mt-6 select-none"
              aria-hidden="true"
            >
              Jasper
            </m.p>
          </div>
          <dl className="about-facts md:w-1/3 mt-6 md:mt-0 space-y-0 rounded-2xl overflow-hidden border border-[#f4d5ad]/15 dark:border-white/10 bg-[#F5E6CA]/40 dark:bg-black/20 divide-y divide-dashed divide-[#f4d5ad]/15 dark:divide-white/10">
            {FACTS.map((f) => (
              <div key={f.label} className="about-fact flex justify-between gap-4 py-3.5 px-4 will-change-transform hover:bg-[#e09f58]/[0.06] transition-colors">
                <dt className="font-mono text-xs uppercase tracking-wide text-[#8B4513]/45 dark:text-[#f4d5ad]/40">{f.label}</dt>
                <dd className="font-mono text-xs font-bold text-right text-[#1a120b] dark:text-[#f4d5ad]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
export default AboutSection;

import { useRef } from 'react';
import { m } from 'framer-motion';
import { CONTACT_BLURB, SOCIALS } from '../../lib/portfolio';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSettings } from '../../lib/settings';
gsap.registerPlugin(ScrollTrigger);
const ContactSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  useGSAP(
    () => {
      if (settings.reduceMotion || !ref.current) return;
      const ctx = gsap.context(() => {
        gsap.from('.contact-pill', {
          y: 20,
          opacity: 0,
          scale: 0.97,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.05,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        });
        // SPAM: glow pulse behind section
        gsap.to('.contact-glow', {
          scale: 1.08,
          opacity: 0.16,
          duration: 3.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        // SPAM: heading char subtle scrub
        gsap.from('.contact-title-char', {
          y: 30,
          rotateX: -15,
          opacity: 0,
          stagger: 0.02,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.contact-title',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
        // SPAM: blurb words scrub
        gsap.from('.contact-word', {
          opacity: 0.15,
          filter: 'blur(2px)',
          stagger: 0.02,
          ease: 'none',
          scrollTrigger: {
            trigger: '.contact-blurb',
            start: 'top 88%',
            end: 'bottom 65%',
            scrub: 0.9,
          },
        });
        // SPAM: pills float skew on scroll
        gsap.to('.contact-pill', {
          yPercent: -4,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.9,
          },
        });
        // SPAM: marquee drift
        gsap.to('.contact-marquee-track', {
          xPercent: -50,
          duration: 22,
          ease: 'none',
          repeat: -1,
        });
      }, ref);
      return () => ctx.revert();
    },
    { scope: ref, dependencies: [settings.reduceMotion] }
  );

  const handleMagnetic = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (settings.reduceMotion) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.14, y: y * 0.2, duration: 0.35, ease: 'power3.out' });
  };
  const resetMagnetic = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  const title = 'Get in touch';
  return (
    <section ref={ref} id="contact" className="relative overflow-hidden p-6 md:p-10 pb-20 max-w-5xl mx-auto scroll-mt-20 text-center">
      <div className="contact-glow pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(224,159,88,0.10),transparent_68%)] blur-[22px] will-change-transform" />
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="font-mono text-xs text-accent mb-2 tracking-widest"
      >
        {'//'} ping
      </m.p>
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="contact-title text-3xl md:text-4xl font-sans font-bold mb-3 text-primary tracking-tight will-change-transform"
      >
        {title.split('').map((c, i) => (
          <span key={i} className="contact-title-char inline-block will-change-transform" style={{ transformOrigin: '50% 100%' }}>{c === ' ' ? '\u00A0' : c}</span>
        ))}
      </m.h2>
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="contact-blurb font-mono text-sm text-primary/60 dark:text-[#f4d5ad]/60 mb-8 max-w-xl mx-auto leading-relaxed flex flex-wrap justify-center gap-x-[0.32em]"
      >
        {CONTACT_BLURB.split(' ').map((w, i) => (
          <span key={i} className="contact-word inline-block will-change-transform">{w}</span>
        ))}
      </m.p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {SOCIALS.map((s, i) => {
          const external = s.href.startsWith('http');
          return (
            <m.a
              key={s.label}
              href={s.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onMouseMove={handleMagnetic}
              onMouseLeave={resetMagnetic}
              className="contact-pill will-change-transform px-6 py-2.5 bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-[#8B4513]/12 dark:border-white/10 font-mono text-sm font-bold rounded-full hover:bg-white dark:hover:bg-white/[0.12] hover:border-[#e09f58]/30 hover:text-[#A0522D] dark:hover:text-[#f4d5ad] hover:shadow-[0_8px_24px_rgba(139,69,19,0.12)] shadow-[0_4px_16px_rgba(139,69,19,0.06)] transition-all duration-300 relative overflow-hidden group"
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(300px_circle_at_50%_0%,rgba(224,159,88,0.18),transparent_70%)]" />
              <span className="relative">{s.label}</span>
            </m.a>
          );
        })}
      </div>
      <div className="contact-marquee mt-12 overflow-hidden rounded-full border border-[#8B4513]/10 dark:border-white/10 bg-[#1a120b]/5 dark:bg-white/[0.03] backdrop-blur py-2">
        <div className="contact-marquee-track flex gap-8 whitespace-nowrap will-change-transform w-[200%]">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[#8B4513]/40 dark:text-[#f4d5ad]/30">ping • pong • dm • email • ship •</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

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

  return (
    <section ref={ref} id="contact" className="p-6 md:p-10 pb-20 max-w-5xl mx-auto scroll-mt-20 text-center">
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
        className="text-3xl md:text-4xl font-sans font-bold mb-3 text-primary tracking-tight"
      >
        Get in touch
      </m.h2>
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="font-mono text-sm text-primary/60 dark:text-[#f4d5ad]/60 mb-8 max-w-xl mx-auto leading-relaxed"
      >
        {CONTACT_BLURB}
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
              className="contact-pill will-change-transform px-6 py-2.5 bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-[#8B4513]/12 dark:border-white/10 font-mono text-sm font-bold rounded-full hover:bg-white dark:hover:bg-white/[0.12] hover:border-[#e09f58]/30 hover:text-[#A0522D] dark:hover:text-[#f4d5ad] hover:shadow-[0_8px_24px_rgba(139,69,19,0.12)] shadow-[0_4px_16px_rgba(139,69,19,0.06)] transition-all duration-300"
            >
              {s.label}
            </m.a>
          );
        })}
      </div>
    </section>
  );
};

export default ContactSection;

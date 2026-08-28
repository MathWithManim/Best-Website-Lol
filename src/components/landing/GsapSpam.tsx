import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useSettings } from '../../lib/settings';

gsap.registerPlugin(ScrollTrigger);

export default function GsapSpam() {
  const ref = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  const reduce = settings.reduceMotion;

  useGSAP(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      // 1) scrubbing text reveals - words fade in sequentially
      gsap.from('.spam-word', {
        opacity: 0.08,
        y: 24,
        filter: 'blur(6px)',
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: '.spam-scrub',
          start: 'top 85%',
          end: 'bottom 55%',
          scrub: 1.2,
        },
      });

      // 2) image scale & fade - start small, grow, fade out
      gsap.utils.toArray<HTMLElement>('.spam-img').forEach((el) => {
        gsap.fromTo(el,
          { scale: 0.82, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              end: 'top 55%',
              scrub: 1,
            },
          }
        );
        gsap.to(el, {
          opacity: 0.18,
          filter: 'brightness(0.6)',
          scrollTrigger: {
            trigger: el,
            start: 'bottom 40%',
            end: 'bottom 5%',
            scrub: 0.8,
          },
        });
      });

      // 3) card stacking - overlap from bottom
      gsap.from('.spam-card', {
        y: 120,
        scale: 0.96,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.spam-stack',
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      });
      // pin the stack title
      ScrollTrigger.create({
        trigger: '.spam-pin-wrap',
        start: 'top top',
        end: '+=800',
        pin: '.spam-pin',
        pinSpacing: true,
        scrub: false,
      });

      // 4) horizontal marquee scrub
      gsap.to('.spam-marquee-track', {
        xPercent: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.spam-marquee',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // 5) hero-like stagger on entry
      gsap.from('.spam-title-char', {
        y: 80,
        rotateX: -20,
        opacity: 0,
        stagger: 0.015,
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.spam-title',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });

      // 6) parallax orbs
      gsap.to('.spam-orb', {
        y: -30,
        x: 12,
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
  }, { scope: ref, dependencies: [reduce] });

  const title = 'GSAP SPAM';
  return (
    <section ref={ref} className="overflow-x-hidden w-full max-w-full bg-[#0d0906] relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-10%,rgba(224,159,88,0.14),transparent_65%)]" />
      <div className="pointer-events-none spam-orb absolute -top-10 right-[12%] w-40 h-40 rounded-full opacity-40 blur-[1px] hidden md:block" style={{ background: 'radial-gradient(circle at 35% 30%, #ffd9a8 0%, #e09f58 42%, #8B4513 100%)', boxShadow: '0 18px 60px rgba(224,159,88,0.35)' }} />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        {/* Title with char split */}
        <h2 className="spam-title font-[Geist,sans-serif] text-[clamp(2.5rem,6vw,5rem)] font-[800] tracking-[-0.05em] leading-[0.9] text-[#f4d5ad] text-center">
          {title.split('').map((c, i) => (
            <span key={i} className="spam-title-char inline-block will-change-transform" style={{ transformOrigin: '50% 100%' }}>{c === ' ' ? '\u00A0' : c}</span>
          ))}
        </h2>
        <p className="mt-3 text-center font-mono text-xs tracking-[0.2em] uppercase text-[#f4d5ad]/40">scroll to spam — pin + scrub + scale + stack</p>

        {/* Scrubbing paragraph */}
        <div className="spam-scrub mt-14 md:mt-20 max-w-3xl mx-auto">
          <p className="font-mono text-lg md:text-xl leading-relaxed text-[#f4d5ad]/90 flex flex-wrap gap-x-2 gap-y-1 justify-center">
            {'No scripts no trust issues the server decides keep rolling stack the cards scale the images scrub the words pin the title spam the motion until it feels alive'.split(' ').map((w, i) => (
              <span key={i} className="spam-word inline-block will-change-transform">{w}</span>
            ))}
          </p>
        </div>

        {/* Image scale & fade row */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {['dicegame','limbo','slots'].map((seed) => (
            <div key={seed} className="spam-img relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a120b] will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0906] via-transparent to-transparent z-10" />
              <img src={`https://picsum.photos/seed/${seed}spam/800/600?grayscale`} alt="" className="w-full h-[280px] md:h-[320px] object-cover opacity-70 mix-blend-luminosity group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#e09f58]">GSAP</span>
                <h3 className="font-cursive text-2xl text-[#f4d5ad] capitalize">{seed}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee scrub */}
        <div className="spam-marquee mt-16 md:mt-20 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] backdrop-blur py-3">
          <div className="spam-marquee-track flex gap-8 whitespace-nowrap will-change-transform w-[200%]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="font-mono text-sm font-bold tracking-[0.18em] uppercase text-[#f4d5ad]/60">GSAP SPAM • PIN • SCRUB • SCALE • STACK • </span>
            ))}
          </div>
        </div>

        {/* Pinned stack */}
        <div className="spam-pin-wrap mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-5">
            <div className="spam-pin">
              <h3 className="font-[Geist,sans-serif] text-3xl md:text-4xl font-bold tracking-tight text-[#f4d5ad] leading-[0.95]">Stack<br/><span className="text-[#e09f58]">on scroll</span></h3>
              <p className="mt-4 font-mono text-sm text-[#f4d5ad]/60 leading-relaxed">Pinned title left, cards stack from bottom on right. Pure ScrollTrigger pin + scrub.</p>
              <a href="/rng" className="mt-6 inline-flex px-6 py-2.5 rounded-full bg-[#f4d5ad] text-[#1a120b] font-mono text-sm font-bold">Play RNG →</a>
            </div>
          </div>
          <div className="spam-stack md:col-span-7 space-y-4">
            {[
              { t: 'Dice Roll', d: 'Slide your odds, server decides', c: 'from-[#1a120b] to-[#2d1e14]' },
              { t: 'Limbo', d: 'How low can you go? Multiply', c: 'from-[#1e160f] to-[#0d0906]' },
              { t: 'Lucky Sevens', d: 'Three reels, one dream', c: 'from-[#14100a] to-[#0d0906]' },
              { t: 'Saturn 404', d: 'Your lottie, now a 404', c: 'from-[#1a120b] to-[#1a0f0a]' },
            ].map((card) => (
              <div key={card.t} className={`spam-card relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${card.c} p-8 md:p-10 will-change-transform`}>
                <h4 className="font-cursive text-2xl text-[#f4d5ad]">{card.t}</h4>
                <p className="mt-2 font-mono text-sm text-[#f4d5ad]/60">{card.d}</p>
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#e09f58]/10 blur-[18px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

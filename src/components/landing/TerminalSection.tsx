import { useEffect, useRef, useState } from 'react';
import { m, useInView } from 'framer-motion';
import { useSettings } from '../../lib/settings';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
interface TermLine {
  cmd: boolean;
  text: string;
}

const LINES: TermLine[] = [
  { cmd: true, text: 'whoami' },
  { cmd: false, text: 'your manipulator frfr' },
  { cmd: true, text: 'exit' },
  { cmd: false, text: 'stop crashing my apps plez' },
  { cmd: true, text: './status --verbose' },
  { cmd: false, text: 'error error everywhere bro omg' },
  { cmd: false, text: 'error error everywhere bro omg' },
  { cmd: false, text: '✓ everything is fine' },
];

const CHAR_MS = 26;
const LINE_PAUSE_MS = 380;

const TerminalSection = () => {
  const { settings } = useSettings();
  const reduce = settings.reduceMotion;
  const ref = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [done, setDone] = useState<{ line: number; char: number }>({ line: 0, char: 0 });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDone({ line: LINES.length, char: 0 });
      return;
    }
    let line = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (line >= LINES.length) return;
      const current = LINES[line].text;
      if (char < current.length) {
        char += 1;
        setDone({ line, char });
        timer = setTimeout(tick, CHAR_MS);
      } else {
        line += 1;
        char = 0;
        setDone({ line, char });
        timer = setTimeout(tick, LINE_PAUSE_MS);
      }
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [inView, reduce]);

  useEffect(() => {
    if (reduce || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.term-card', {
        y: 36,
        opacity: 0,
        scale: 0.985,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.term-card',
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
      gsap.to('.term-card', {
        yPercent: -3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
      // SPAM: glitch flicker on title
      gsap.to('.term-glitch', {
        x: 1,
        skewX: 0.4,
        duration: 0.07,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: -1,
        repeatDelay: 2.5,
      });
      // SPAM: scanline move
      gsap.to('.term-scan', {
        yPercent: 100,
        duration: 2.2,
        ease: 'none',
        repeat: -1,
      });
      // SPAM: glow pulse
      gsap.to('.term-glow', {
        opacity: 0.22,
        scale: 1.04,
        duration: 2.8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      // SPAM: lines stagger reveal
      gsap.from('.term-line', {
        x: -8,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.term-card',
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      });
      // SPAM: RGB split on hover handled via CSS, but scrub skew
      gsap.to('.term-card', {
        skewY: 0.18,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduce]);

  const finished = done.line >= LINES.length;

  return (
    <section ref={sectionRef} className="overflow-x-hidden w-full max-w-full py-24 md:py-36 bg-[#0d0906] relative" aria-label="Terminal session">
      <div className="term-glow absolute inset-0 bg-[radial-gradient(800px_circle_at_50%_-10%,rgba(224,159,88,0.14),transparent_65%)] pointer-events-none will-change-transform" />
      <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_80%_110%,rgba(224,159,88,0.08),transparent_60%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto px-6 md:px-10 relative text-center">
        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="term-glitch font-mono text-xs text-accent mb-2 tracking-widest text-center will-change-transform"
        >
          {'//'} session
        </m.p>
        <div
          ref={ref}
          className="term-card relative text-left bg-[#0d0906]/95 border border-[#f4d5ad]/10 rounded-[22px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(244,213,173,0.08)] will-change-transform"
          role="img"
          aria-label="Terminal showing a playful status session"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f4d5ad]/10 bg-[#f4d5ad]/5 backdrop-blur">
            <span className="w-3 h-3 rounded-full bg-[#c0392b]/80 shadow-[0_0_12px_rgba(192,57,43,0.55)]" />
            <span className="w-3 h-3 rounded-full bg-[#c9962e]/80 shadow-[0_0_12px_rgba(201,150,46,0.45)]" />
            <span className="w-3 h-3 rounded-full bg-[#27ae60]/80 shadow-[0_0_12px_rgba(39,174,96,0.45)]" />
            <span className="ml-3 font-mono text-[11px] text-[#f4d5ad]/40">jasper@site: ~</span>
            <span className="ml-auto font-mono text-[10px] tracking-widest uppercase text-white/30 hidden md:inline">zsh — 80×24</span>
          </div>
          <div className="p-5 md:p-6 font-mono text-sm md:text-base leading-loose min-h-[13rem] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `repeating-linear-gradient(transparent, transparent 22px, rgba(244,213,173,0.6) 22px, rgba(244,213,173,0.6) 23px)` }} />
            <div className="term-scan pointer-events-none absolute inset-0 opacity-[0.06]" style={{ background: `linear-gradient(transparent 0%, rgba(224,159,88,0.18) 50%, transparent 100%)`, height: '40%', transform: 'translateY(-100%)' }} />
            {LINES.map((l, i) => {
              if (i > done.line) return null;
              const isCurrent = i === done.line && !finished;
              const text = isCurrent ? l.text.slice(0, done.char) : l.text;
              return (
                <div key={i} className="term-line whitespace-pre-wrap break-words relative will-change-transform">
                  {l.cmd && <span className="text-accent mr-2">$</span>}
                  <span className={l.cmd ? 'text-[#f4d5ad]' : 'text-[#f4d5ad]/70'}>{text}</span>
                  {isCurrent && (
                    <span aria-hidden="true" className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-accent terminal-cursor" />
                  )}
                  {i === LINES.length - 1 && finished && (
                    <span aria-hidden="true" className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-accent terminal-cursor" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TerminalSection;

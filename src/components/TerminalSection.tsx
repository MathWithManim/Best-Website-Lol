import { useEffect, useRef, useState } from 'react';
import { m, useInView } from 'framer-motion';
import { useSettings } from '../lib/settings';

interface TermLine {
  cmd: boolean;
  text: string;
}

const LINES: TermLine[] = [
  { cmd: true, text: 'whoami' },
  { cmd: false, text: 'jasper — full-stack developer' },
  { cmd: true, text: 'cat now.txt' },
  { cmd: false, text: 'building things that actually ship' },
  { cmd: true, text: './status --verbose' },
  { cmd: false, text: 'coffee: critical · motivation: max' },
  { cmd: false, text: '✓ everything is fine' },
];

const CHAR_MS = 26;
const LINE_PAUSE_MS = 380;

const TerminalSection = () => {
  const { settings } = useSettings();
  const reduce = settings.reduceMotion;
  const ref = useRef<HTMLDivElement>(null);
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

  const finished = done.line >= LINES.length;

  return (
    <section className="overflow-x-hidden w-full max-w-full py-24 md:py-36 bg-gradient-to-b from-[#0d0906] via-[#1a120b] to-[#0d0906]" aria-label="Terminal session">
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="font-mono text-xs text-accent mb-2 tracking-widest"
      >
        {'//'} session
      </m.p>
      <m.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        className="bg-[#0d0906]/95 border border-[#f4d5ad]/10 rounded-3xl overflow-hidden shadow-[inset_0_1px_0_rgba(244,213,173,0.08)]"
        role="img"
        aria-label="Terminal showing a playful status session"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f4d5ad]/10 bg-[#f4d5ad]/5">
          <span className="w-3 h-3 rounded-full bg-[#c0392b]/80" />
          <span className="w-3 h-3 rounded-full bg-[#c9962e]/80" />
          <span className="w-3 h-3 rounded-full bg-[#27ae60]/80" />
          <span className="ml-3 font-mono text-[11px] text-[#f4d5ad]/40">jasper@site: ~</span>
        </div>
        <div className="p-5 md:p-6 font-mono text-sm md:text-base leading-loose min-h-[13rem]">
          {LINES.map((l, i) => {
            if (i > done.line) return null;
            const isCurrent = i === done.line && !finished;
            const text = isCurrent ? l.text.slice(0, done.char) : l.text;
            return (
              <div key={i} className="whitespace-pre-wrap break-words">
                {l.cmd && <span className="text-accent mr-2">$</span>}
                <span className={l.cmd ? 'text-[#f4d5ad]' : 'text-[#f4d5ad]/70'}>{text}</span>
                {isCurrent && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-accent terminal-cursor"
                  />
                )}
                {i === LINES.length - 1 && finished && (
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-4 ml-0.5 align-[-2px] bg-accent terminal-cursor"
                  />
                )}
              </div>
            );
          })}
        </div>
      </m.div>
    </section>
  );
};

export default TerminalSection;

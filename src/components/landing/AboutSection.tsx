import { m } from 'framer-motion';
import { ABOUT_PARAGRAPHS, FACTS } from '../lib/portfolio';

const AboutSection = () => {
  return (
    <section id="about" className="p-6 md:p-10 max-w-5xl mx-auto scroll-mt-20">
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="font-mono text-xs text-accent mb-2 tracking-widest"
      >
        {'//'} who
      </m.p>
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary"
      >
        About
      </m.h2>

      <m.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55 }}
        className="relative bg-secondary/10 backdrop-blur-sm border border-[#f4d5ad]/15 rounded-2xl overflow-hidden hover:border-[#e09f58]/40 transition-colors duration-200"
      >
        <div className="flex items-center justify-between gap-4 px-5 md:px-7 py-3 border-b border-[#f4d5ad]/15 bg-[#f4d5ad]/5">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#f4d5ad]/60">
            Dossier — 001
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent rotate-[-1.5deg] border border-accent/50 rounded px-2 py-0.5">
            Subject: Jasper Sona
          </span>
        </div>

        <div className="p-5 md:p-7 md:flex md:gap-10">
          <div className="md:w-2/3">
            {ABOUT_PARAGRAPHS.map((p, i) => (
              <m.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.45 }}
                className="font-mono text-sm md:text-base text-[#f4d5ad]/75 leading-relaxed mb-4 last:mb-0"
              >
                {p}
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

          <dl className="md:w-1/3 mt-6 md:mt-0 space-y-3">
            {FACTS.map((f, i) => (
              <m.div
                key={f.label}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                className="flex justify-between gap-4 py-2 border-b border-dashed border-[#f4d5ad]/20"
              >
                <dt className="font-mono text-xs uppercase tracking-wide text-[#f4d5ad]/40">
                  {f.label}
                </dt>
                <dd className="font-mono text-xs font-bold text-right text-[#f4d5ad]">{f.value}</dd>
              </m.div>
            ))}
          </dl>
        </div>
      </m.div>
    </section>
  );
};

export default AboutSection;

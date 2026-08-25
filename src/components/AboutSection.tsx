import { m } from 'framer-motion';
import { ABOUT_PARAGRAPHS, FACTS } from '../lib/portfolio';

const AboutSection = () => {
  return (
    <section id="about" className="p-6 md:p-10 max-w-5xl mx-auto scroll-mt-20">
      <div className="md:flex md:gap-10">
        <div className="md:w-2/3">
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
          {ABOUT_PARAGRAPHS.map((p, i) => (
            <m.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="font-mono text-sm md:text-base text-primary/70 dark:text-[#f4d5ad]/70 leading-relaxed mb-4"
            >
              {p}
            </m.p>
          ))}
        </div>
        <dl className="md:w-1/3 mt-8 md:mt-14 space-y-3">
          {FACTS.map((f, i) => (
            <m.div
              key={f.label}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex justify-between gap-4 py-2 border-b border-primary/15 dark:border-[#f4d5ad]/15"
            >
              <dt className="font-mono text-xs uppercase tracking-wide text-primary/40 dark:text-[#f4d5ad]/40">
                {f.label}
              </dt>
              <dd className="font-mono text-xs font-bold text-right text-primary dark:text-[#f4d5ad]">{f.value}</dd>
            </m.div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default AboutSection;

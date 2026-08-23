import { m } from 'framer-motion';
import { SKILL_GROUPS } from '../lib/portfolio';

const SkillsSection = () => {
  return (
    <section id="skills" className="p-6 md:p-10 max-w-5xl mx-auto scroll-mt-20">
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary dark:text-[#f4d5ad]"
      >
        Skills
      </m.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SKILL_GROUPS.map((g, i) => (
          <m.div
            key={g.group}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className="p-5 bg-secondary/20 dark:bg-secondary/10 border border-primary/20 dark:border-[#f4d5ad]/20 rounded-lg"
          >
            <h3 className="font-mono text-sm uppercase tracking-wide text-accent dark:text-[#c98a6e] mb-3">
              {g.group}
            </h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-full bg-primary/10 dark:bg-[#f4d5ad]/10 border border-primary/15 dark:border-[#f4d5ad]/15 font-mono text-xs text-primary/75 dark:text-[#f4d5ad]/75"
                >
                  {item}
                </span>
              ))}
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;

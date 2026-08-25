import { m } from 'framer-motion';
import { SKILL_GROUPS } from '../lib/portfolio';

const SkillsSection = () => {
  return (
    <section id="skills" className="p-6 md:p-10 max-w-5xl mx-auto scroll-mt-20">
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="font-mono text-xs text-accent mb-2 tracking-widest"
      >
        {'//'} stack
      </m.p>
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary"
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
            className="p-5 bg-secondary/10 backdrop-blur-sm border border-[#f4d5ad]/15 rounded-xl hover:border-[#e09f58]/40 transition-colors duration-200"
          >
            <h3 className="font-mono text-sm uppercase tracking-wide text-accent mb-3">
              {g.group}
            </h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 rounded-full bg-[#f4d5ad]/8 border border-[#f4d5ad]/15 font-mono text-xs text-[#f4d5ad]/75 hover:text-[#f4d5ad] hover:border-[#e09f58]/50 transition-colors duration-150"
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

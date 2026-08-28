import { m } from 'framer-motion';
import { CONTACT_BLURB, SOCIALS } from '../lib/portfolio';

const ContactSection = () => {
  return (
    <section id="contact" className="p-6 md:p-10 pb-16 max-w-5xl mx-auto scroll-mt-20 text-center">
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
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-sans font-bold mb-3 text-primary"
      >
        Get in touch
      </m.h2>
      <m.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="font-mono text-sm text-primary/60 dark:text-[#f4d5ad]/60 mb-6"
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
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="px-5 py-2 bg-secondary/10 border border-primary/25 font-mono text-sm font-bold rounded-xl hover:border-accent hover:text-accent hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
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

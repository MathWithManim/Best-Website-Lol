import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PROJECTS } from '../lib/portfolio';

const ProjectsSection = () => {
  return (
    <section id="projects" className="p-6 md:p-10 max-w-5xl mx-auto scroll-mt-20">
      <m.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary dark:text-[#f4d5ad]"
      >
        Projects
      </m.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROJECTS.map((project, i) => (
          <m.article
            key={project.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className={`flex flex-col p-5 bg-secondary/20 dark:bg-secondary/10 border border-primary/20 dark:border-[#f4d5ad]/20 rounded-lg ${
              i === 0 ? 'md:col-span-2' : ''
            }`}
          >
            <h3 className="font-mono text-lg font-bold text-primary dark:text-[#f4d5ad] mb-2">{project.title}</h3>
            <p className="font-mono text-sm text-primary/70 dark:text-[#f4d5ad]/70 leading-relaxed">
              {project.description}
            </p>
            {project.bullets && (
              <ul className="mt-3 space-y-1.5">
                {project.bullets.map((b) => (
                  <li key={b} className="font-mono text-xs text-primary/60 dark:text-[#f4d5ad]/60 leading-snug pl-3 relative before:content-['▸'] before:absolute before:left-0 before:text-accent dark:before:text-[#c98a6e]">
                    {b}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-full bg-primary/10 dark:bg-[#f4d5ad]/10 border border-primary/15 dark:border-[#f4d5ad]/15 font-mono text-[10px] text-primary/70 dark:text-[#f4d5ad]/70"
                >
                  {s}
                </span>
              ))}
            </div>
            {project.href && project.href.startsWith('/') && (
              <Link
                to={project.href}
                className="mt-4 inline-block self-start px-4 py-2 bg-primary dark:bg-accent text-bg dark:text-[#1a120b] font-mono text-xs font-bold rounded-lg hover:opacity-90 transition-opacity active:scale-95"
              >
                {project.hrefLabel || 'Open'}
              </Link>
            )}
          </m.article>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;

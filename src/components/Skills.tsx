import { m } from 'framer-motion';

const steps = [
  {
    icon: '🎲',
    title: 'Roll',
    body: 'Hit ROLL to spin the reel. Every roll costs LuckBucks and every outcome is weighted by rarity.',
  },
  {
    icon: '📜',
    title: 'Collect',
    body: 'Catch each rarity to fill your collection. Sell duplicates for LuckBucks to fund more rolls.',
  },
  {
    icon: '♻️',
    title: 'Rebirth',
    body: 'Catch enough distinct rarities and Rebirth — reset your progress and unlock 10 more rarities.',
  },
  {
    icon: '🎨',
    title: 'Customize',
    body: 'Spend LuckBucks on luck boosts and cosmetics. Equip themes and companions from the shop.',
  },
];

const Skills = () => {
  return (
    <section className="p-6 md:p-10 md:w-1/2">
      <h2 className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary dark:text-[#f4d5ad]">How to Play</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, index) => (
          <m.div
            key={step.title}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="p-6 bg-secondary/20 dark:bg-secondary/10 border border-primary/20 dark:border-[#f4d5ad]/20 rounded-lg"
          >
            <div className="text-3xl mb-2" aria-hidden>{step.icon}</div>
            <h3 className="font-mono text-lg font-bold text-primary dark:text-[#f4d5ad] mb-1">{step.title}</h3>
            <p className="font-mono text-sm text-primary/70 dark:text-[#f4d5ad]/70 leading-relaxed">{step.body}</p>
          </m.div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
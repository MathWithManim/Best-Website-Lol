import { motion } from 'framer-motion';

const skills = ['Manim', 'Manim', 'TypeScript', 'Framer Motion'];

const Skills = () => {
  return (
    <section className="p-6 md:p-10 md:w-1/2">
      <h2 className="text-3xl md:text-4xl font-sans font-bold mb-6 text-primary">Skills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="p-6 bg-secondary/20 border border-primary/20 rounded-lg font-mono text-xl text-primary"
          >
            {skill}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Skills;

import { m, useScroll, useSpring } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <>
      <m.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#e09f58] via-[#ffbf7a] to-[#e09f58] z-50 origin-left will-change-transform"
      />
      <m.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] blur-[6px] bg-gradient-to-r from-[#e09f58] via-[#ffbf7a] to-[#e09f58] z-50 origin-left opacity-60 will-change-transform pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
};

export default ScrollProgress;

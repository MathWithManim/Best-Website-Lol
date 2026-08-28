/**
 * Elite motion variants - single source for all framer-motion + GSAP timing
 * Import these instead of ad-hoc initial/animate objects
 */

// Framer-motion variants (type-safe, reusable)
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeBlur = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// The "premium" easing used everywhere
export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const EASE_EXPO = [0.22, 1, 0.36, 1] as const;

// For GSAP: utility to split text into spans (no SplitText plugin needed)
export function splitText(el: HTMLElement) {
  const text = el.textContent || "";
  el.innerHTML = "";
  const chars = text.split("").map((char) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.willChange = "transform";
    return span;
  });
  chars.forEach((c) => el.appendChild(c));
  return chars;
}

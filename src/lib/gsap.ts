import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Global defaults - buttery, premium feel
gsap.defaults({
  ease: "power3.out",
  duration: 0.8,
});

export { gsap, ScrollTrigger, useGSAP };

// Reusable easings - the secret sauce
export const EASE = {
  expoOut: "expo.out",
  expoInOut: "expo.inOut",
  power4Out: "power4.out",
  power3Out: "power3.out",
  circOut: "circ.out",
  backOut: "back.out(1.2)",
  elastic: "elastic.out(1, 0.6)",
  smooth: "0.16, 1, 0.3, 1", // custom bezier for premium UI
} as const;

// Respect reduced motion globally
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    localStorage.getItem("settings:v1")?.includes('"reduceMotion":true') ||
    false
  );
}

// Helper: kill all ScrollTriggers on route change
export function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSettings } from "../../lib/settings";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const { settings } = useSettings();
  const reduce = settings.reduceMotion;

  useGSAP(
    () => {
      if (reduce || !sectionRef.current) return;

      const ctx = gsap.context(() => {
        // Title word-by-word reveal
        gsap.from(".bento-title-word", {
          y: 72,
          opacity: 0,
          rotateX: -18,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: ".bento-title",
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });

        // Cards: batch reveal with stagger
        gsap.from(".bento-card", {
          y: 54,
          opacity: 0,
          scale: 0.97,
          duration: 0.9,
          ease: "power3.out",
          stagger: {
            amount: 0.35,
            from: "start",
          },
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        });

        // Parallax on images inside cards
        gsap.utils.toArray<HTMLElement>(".bento-media").forEach((el) => {
          gsap.to(el, {
            yPercent: -10,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest(".bento-card") as Element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
            },
          });
        });

        // Number counter drift
        gsap.to(".bento-number", {
          yPercent: -14,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        // Horizontal marquee strip subtle progress
        const strip = document.querySelector(".bento-strip") as HTMLElement | null;
        if (strip) {
          gsap.to(strip, {
            xPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: strip,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          });
        }
      }, sectionRef);

      return () => ctx.revert();
    },
    { scope: sectionRef, dependencies: [reduce] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0a0a0c] py-24 md:py-36 px-6 md:px-12"
    >
      {/* Top hairline */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[980px] h-[420px] rounded-full blur-[42px] opacity-60"
        style={{
          background: "radial-gradient(ellipse at center, rgba(224,159,88,0.16), transparent 68%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        <div className="bento-title mb-10 md:mb-14">
          <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/45 mb-4">
            Motion · Architecture · Play
          </p>
          <h2 className="font-[Geist] text-[2rem] md:text-6xl text-white tracking-[-0.04em] leading-[0.95] flex flex-wrap items-center gap-x-3">
            <span className="overflow-hidden inline-block">
              <span className="bento-title-word inline-block will-change-transform">Motion-bound</span>
            </span>
            <span
              className="bento-title-word inline-block w-14 h-9 md:w-28 md:h-16 rounded-full bg-cover bg-center align-middle shadow-2xl ring-2 ring-white/10 will-change-transform"
              style={{ backgroundImage: "url('https://picsum.photos/seed/motion/400/300')" }}
              aria-hidden="true"
            />
            <span className="overflow-hidden inline-block">
              <span className="bento-title-word inline-block will-change-transform">architecture</span>
            </span>
          </h2>
          <p className="bento-title-word mt-4 max-w-2xl font-mono text-sm md:text-base text-white/60 leading-relaxed">
            Scroll-native, GPU-accelerated, respect-for-reduced-motion. GSAP + Lenis + ScrollTrigger working together — not fighting.
          </p>
        </div>

        <div className="bento-grid grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[320px] md:auto-rows-[420px] grid-flow-dense">
          {/* Pinned hero card */}
          <div className="bento-card md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-white/10 bg-[#121214] will-change-transform">
            <img
              src="https://picsum.photos/seed/studio/1600/1000"
              alt=""
              className="bento-media absolute inset-0 w-full h-[118%] -top-[9%] object-cover will-change-transform scale-[1.02] group-hover:scale-[1.06] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-transparent" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(520px_circle_at_50%_120%,rgba(224,159,88,0.18),transparent_60%)]" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 px-3 py-1 text-[11px] font-mono tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                Pinned scroll ready
              </span>
              <h3 className="font-[Geist] text-3xl md:text-5xl leading-none mt-4">Cinematic bento</h3>
              <p className="text-white/70 text-sm md:text-base mt-3 leading-relaxed">
                Title locks while imagery climbs — parallax, not jank. Respects your scroll, feels like native.
              </p>
            </div>
          </div>

          <div className="bento-card relative overflow-hidden rounded-[28px] group shadow-2xl ring-1 ring-white/10 bg-[#121214] will-change-transform">
            <img
              src="https://picsum.photos/seed/stack/800/700"
              alt=""
              className="bento-media absolute inset-0 w-full h-[116%] -top-[8%] object-cover opacity-90 group-hover:opacity-100 will-change-transform transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/35 to-transparent" />
            <div className="absolute top-4 left-4 rounded-full bg-white text-black text-[11px] font-mono font-bold px-2.5 py-1">STACK</div>
          </div>

          <div className="bento-card relative overflow-hidden rounded-[28px] group shadow-2xl ring-1 ring-white/10 bg-[#121214] md:row-span-2 will-change-transform">
            <img
              src="https://picsum.photos/seed/vertical/800/1100"
              alt=""
              className="bento-media absolute inset-0 w-full h-[116%] -top-[8%] object-cover will-change-transform group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />
            <div className="bento-number absolute top-6 right-6 md:top-8 md:right-8 will-change-transform">
              <span className="font-[Geist] text-6xl md:text-8xl text-white/12 leading-none tracking-tighter">01</span>
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-4">
              <p className="font-mono text-xs text-white/80">ScrollTrigger scrub: 0.9</p>
              <p className="font-mono text-[11px] text-white/50">GPU-accelerated, no layout thrash</p>
            </div>
          </div>

          <div className="bento-card relative overflow-hidden rounded-[28px] group shadow-2xl ring-1 ring-white/10 bg-[#121214] md:col-span-2 will-change-transform">
            <img
              src="https://picsum.photos/seed/horizontal/1200/500"
              alt=""
              className="bento-media absolute inset-0 w-full h-[118%] -top-[9%] object-cover will-change-transform group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
              <h4 className="font-[Geist] text-2xl md:text-4xl leading-none">Horizontal accordions</h4>
              <p className="font-mono text-xs md:text-sm text-white/65 mt-2">Hover → scale, scrub → parallax</p>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="bento-strip mt-10 md:mt-14 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none will-change-transform" style={{ scrollbarWidth: "none" }}>
          {["https://picsum.photos/seed/m1/300/300", "https://picsum.photos/seed/m2/300/300", "https://picsum.photos/seed/m3/300/300", "https://picsum.photos/seed/m4/300/300", "https://picsum.photos/seed/m5/300/300"].map((src, i) => (
            <div key={i} className="snap-start shrink-0 w-64 md:w-72 h-64 md:h-72 rounded-[24px] overflow-hidden ring-1 ring-white/10 shadow-2xl group bg-[#141418]">
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover scale-[1.06] group-hover:scale-[1.12] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] grayscale group-hover:grayscale-0"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] tracking-widest uppercase text-white/30">Drag · Scroll · Momentum preserved</p>
      </div>
    </section>
  );
}

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedBento() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0a0a0c] py-32 md:py-48 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="font-[Geist] text-4xl md:text-6xl text-white mb-20 tracking-tight leading-none">
          Motion-bound <span className="inline-block w-16 h-12 md:w-28 md:h-16 rounded-full bg-cover bg-center mx-2 align-middle shadow-2xl ring-2 ring-white/10" style={{ backgroundImage: "url('https://picsum.photos/seed/motion/400/300')" }} /> architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[320px] md:auto-rows-[420px] grid-flow-dense">
          <div className="md:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl group shadow-2xl ring-1 ring-white/10">
            <img src="https://picsum.photos/seed/studio/1600/1000" alt="studio" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out grayscale contrast-125 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white max-w-md">
              <h3 className="font-[Geist] text-3xl md:text-5xl leading-none mb-3">Pinned Scroll</h3>
              <p className="text-white/70 text-base md:text-lg">Title locks left while imagery climbs upward — pure cinematic separation.</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl group shadow-2xl ring-1 ring-white/10 bg-[#121214]">
            <img src="https://picsum.photos/seed/stack/800/700" alt="stack" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 scale-[0.9] group-hover:scale-105 group-hover:-translate-y-2 duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
          </div>

          <div className="relative overflow-hidden rounded-3xl group shadow-2xl ring-1 ring-white/10 bg-[#121214] md:row-span-2">
            <img src="https://picsum.photos/seed/vertical/800/1100" alt="vertical" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out grayscale contrast-125 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute top-6 right-6 md:top-10 md:right-10">
              <span className="font-[Geist] text-6xl md:text-8xl text-white/10 leading-none tracking-tighter">01</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl group shadow-2xl ring-1 ring-white/10 bg-[#121214] md:col-span-2">
            <img src="https://picsum.photos/seed/horizontal/1200/500" alt="horizontal" className="w-full h-full object-cover scale-[0.85] group-hover:scale-100 transition-transform duration-700 ease-out contrast-125" />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
              <h4 className="font-[Geist] text-2xl md:text-4xl leading-none">Horizontal accordions</h4>
            </div>
          </div>
        </div>

        <div className="mt-24 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {["https://picsum.photos/seed/m1/300/300", "https://picsum.photos/seed/m2/300/300", "https://picsum.photos/seed/m3/300/300", "https://picsum.photos/seed/m4/300/300"].map((src, i) => (
            <div key={i} className="snap-start shrink-0 w-72 h-72 rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-2xl group">
              <img src={src} alt="partner" className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700 ease-out grayscale hover:grayscale-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

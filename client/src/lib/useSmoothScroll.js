import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "./motion.js";

gsap.registerPlugin(ScrollTrigger);

export default function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on("scroll", ScrollTrigger.update);
    // the page transition resets scroll through this
    window.__lenis = lenis;

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
}

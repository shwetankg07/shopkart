import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";
import "./PageTransition.css";

const resetScroll = () => {
  if (window.__lenis) {
    window.__lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
};

// a cobalt sheet rises over the page, the route swaps while it's covered, then it carries on up
export default function PageTransition({ location, displayLocation, onSwap }) {
  const root = useRef(null);
  const timeline = useRef(null);
  const onSwapRef = useRef(onSwap);
  const displayRef = useRef(displayLocation);

  useEffect(() => {
    onSwapRef.current = onSwap;
    displayRef.current = displayLocation;
  });

  useEffect(() => {
    if (location.pathname === displayRef.current.pathname) return;

    if (prefersReducedMotion()) {
      onSwapRef.current();
      resetScroll();
      return;
    }

    const sheet = root.current.querySelector(".pt-sheet");
    const mark = root.current.querySelector(".pt-mark");

    if (timeline.current) timeline.current.kill();

    const t = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    timeline.current = t;

    t.set(root.current, { autoAlpha: 1 })
      .set(sheet, { yPercent: 100 })
      .set(mark, { yPercent: 60, autoAlpha: 0 })
      .to(sheet, { yPercent: 0, duration: 0.42 })
      .to(mark, { yPercent: 0, autoAlpha: 1, duration: 0.28, ease: "power3.out" }, 0.22)
      .add(() => {
        onSwapRef.current();
        resetScroll();
      })
      .to(mark, { yPercent: -60, autoAlpha: 0, duration: 0.22, ease: "power3.in" }, "+=0.06")
      .to(sheet, { yPercent: -100, duration: 0.42 }, "<0.04")
      .set(root.current, { autoAlpha: 0 });
  }, [location]);

  return (
    <div className="pt" ref={root} aria-hidden="true">
      <div className="pt-sheet">
        <span className="pt-mark">shopkart</span>
      </div>
    </div>
  );
}

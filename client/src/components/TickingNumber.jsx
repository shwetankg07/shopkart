import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "../lib/motion.js";

const format = (value) => Math.round(value).toLocaleString("en-IN");

// when the number changes it counts from the old value to the new one instead of jumping
export default function TickingNumber({ value }) {
  const ref = useRef(null);
  const shown = useRef(value);

  useLayoutEffect(() => {
    const el = ref.current;

    if (prefersReducedMotion() || shown.current === value) {
      el.textContent = format(value);
      shown.current = value;
      return;
    }

    const counter = { n: shown.current };
    const tween = gsap.to(counter, {
      n: value,
      duration: 0.6,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = format(counter.n);
        shown.current = counter.n;
      },
    });

    return () => tween.kill();
  }, [value]);

  return <span ref={ref} className="tick" />;
}

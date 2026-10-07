import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { hasFinePointer, prefersReducedMotion } from "../lib/motion.js";
import "./Cursor.css";

// a cobalt dot that trails the pointer and opens up into a label over anything marked data-cursor
export default function Cursor() {
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const dot = dotRef.current;
    gsap.set(dot, { xPercent: -50, yPercent: -50 });
    const moveX = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3" });
    const moveY = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3" });

    const onMove = (event) => {
      dot.classList.add("is-on");
      moveX(event.clientX);
      moveY(event.clientY);
    };

    const onOver = (event) => {
      const target = event.target.closest("[data-cursor]");
      if (target) {
        labelRef.current.textContent = target.dataset.cursor;
        dot.classList.add("is-label");
      } else {
        dot.classList.remove("is-label");
      }
    };

    const onLeave = () => dot.classList.remove("is-on");

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // gsap only moves the outer div, css scales the inner one. gsap takes over the transform of anything it moves
  return (
    <div className="cursor" ref={dotRef} aria-hidden="true">
      <div className="cursor-dot">
        <span ref={labelRef} />
      </div>
    </div>
  );
}

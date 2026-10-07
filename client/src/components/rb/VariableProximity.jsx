import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion.js";

// React Bits "Variable Proximity": each letter's font axes move toward `to` as the pointer gets close
const parseAxes = (settings) => {
  const axes = {};
  for (const part of settings.split(",")) {
    const [name, value] = part.trim().split(" ");
    axes[name.replace(/'/g, "")] = parseFloat(value);
  }
  return axes;
};

export default function VariableProximity({ label, from, to, radius = 220, className }) {
  const rootRef = useRef(null);
  const letterRefs = useRef([]);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const fromAxes = parseAxes(from);
    const toAxes = parseAxes(to);
    const pointer = { x: -9999, y: -9999 };
    let frame = null;

    const paint = () => {
      frame = null;
      for (const letter of letterRefs.current) {
        if (!letter) continue;
        const rect = letter.getBoundingClientRect();
        const distance = Math.hypot(pointer.x - (rect.left + rect.width / 2), pointer.y - (rect.top + rect.height / 2));
        // gaussian falloff: full effect under the pointer, fading out smoothly toward the radius
        const strength = Math.exp(-((distance / (radius / 2)) ** 2) / 2);

        const parts = [];
        for (const axis in fromAxes) {
          const value = fromAxes[axis] + (toAxes[axis] - fromAxes[axis]) * strength;
          parts.push(`'${axis}' ${value.toFixed(1)}`);
        }
        letter.style.fontVariationSettings = parts.join(", ");
      }
    };

    const onMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (frame === null) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [from, to, radius]);

  return (
    <span className={className} ref={rootRef} aria-label={label}>
      {label.split("").map((letter, index) => (
        <span className="vp-mask" key={index} aria-hidden="true">
          <span
            className="vp-letter"
            ref={(el) => {
              letterRefs.current[index] = el;
            }}
            style={{ fontVariationSettings: from }}
          >
            {letter}
          </span>
        </span>
      ))}
    </span>
  );
}

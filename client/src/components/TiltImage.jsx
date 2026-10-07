import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { hasFinePointer, prefersReducedMotion } from "../lib/motion.js";
import { showFallbackImage } from "../lib/catalog.js";

export default function TiltImage({ src, alt, imageRef }) {
  const frameRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const frame = frameRef.current;
    const rotateX = gsap.quickTo(imageRef.current, "rotationX", { duration: 0.5, ease: "power3" });
    const rotateY = gsap.quickTo(imageRef.current, "rotationY", { duration: 0.5, ease: "power3" });

    const onMove = (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(x * 10);
      rotateX(y * -10);
    };

    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    return () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
    };
  }, [imageRef]);

  return (
    <div className="tilt" ref={frameRef}>
      <img ref={imageRef} src={src} alt={alt} onError={showFallbackImage} />
    </div>
  );
}

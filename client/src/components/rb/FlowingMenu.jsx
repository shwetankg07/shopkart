import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion.js";

// React Bits "Flowing Menu": on hover a marquee of the row's word and photo wipes in from the edge you came from
export default function FlowingMenu({ items }) {
  return (
    <div className="fm">
      {items.map((item) => (
        <MenuRow key={item.text} {...item} />
      ))}
    </div>
  );
}

function MenuRow({ text, meta, img, to }) {
  const rowRef = useRef(null);
  const marqueeRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const part = innerRef.current.querySelector(".fm-part");
    const loop = gsap.to(innerRef.current, {
      x: -part.offsetWidth,
      duration: 14,
      ease: "none",
      repeat: -1,
    });
    return () => loop.kill();
  }, [text, img]);

  const edgeOf = (event) => {
    const rect = rowRef.current.getBoundingClientRect();
    if (event.clientY - rect.top < rect.height / 2) return "top";
    return "bottom";
  };

  const wipeAllowed = () => hasFinePointer() && !prefersReducedMotion();

  const handleEnter = (event) => {
    if (!wipeAllowed()) return;
    const edge = edgeOf(event);
    gsap
      .timeline({ defaults: { duration: 0.6, ease: "expo" } })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(innerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, innerRef.current], { y: "0%" }, 0);
  };

  const handleLeave = (event) => {
    if (!wipeAllowed()) return;
    const edge = edgeOf(event);
    gsap
      .timeline({ defaults: { duration: 0.6, ease: "expo" } })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(innerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  const parts = [0, 1, 2, 3, 4, 5];

  return (
    <Link to={to} className="fm-row" ref={rowRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span className="fm-word">{text}</span>
      <span className="fm-meta">{meta}</span>

      <span className="fm-marquee" ref={marqueeRef} aria-hidden="true">
        <span className="fm-inner" ref={innerRef}>
          {parts.map((n) => (
            <span className="fm-part" key={n}>
              <span className="fm-part-word">{text}</span>
              <span className="fm-part-img" style={{ backgroundImage: `url(${img})` }} />
            </span>
          ))}
        </span>
      </span>
    </Link>
  );
}

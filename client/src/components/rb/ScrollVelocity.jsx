import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from "motion/react";

// React Bits "Scroll Velocity": a strip that drifts on its own and speeds up with scrolling
const wrap = (min, max, value) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

function useWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (ref.current) setWidth(ref.current.offsetWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);

  return width;
}

function Row({ children, baseVelocity }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });

  const copyRef = useRef(null);
  const copyWidth = useWidth(copyRef);
  const direction = useRef(1);

  const x = useTransform(baseX, (value) => {
    if (copyWidth === 0) return "0px";
    return `${wrap(-copyWidth, 0, value)}px`;
  });

  useAnimationFrame((time, delta) => {
    let moveBy = direction.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) direction.current = -1;
    if (velocityFactor.get() > 0) direction.current = 1;

    moveBy = moveBy + direction.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="sv-viewport">
      <motion.div className="sv-row" style={{ x }}>
        <span className="sv-copy" ref={copyRef}>
          {children}
        </span>
        <span className="sv-copy">{children}</span>
        <span className="sv-copy">{children}</span>
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({ rows, velocity = 40 }) {
  return (
    <div className="sv" aria-hidden="true">
      {rows.map((row, index) => (
        <Row key={index} baseVelocity={index % 2 === 0 ? velocity : -velocity}>
          {row}
        </Row>
      ))}
    </div>
  );
}

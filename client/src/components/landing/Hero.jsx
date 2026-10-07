import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import VariableProximity from "../rb/VariableProximity.jsx";
import { prefersReducedMotion } from "../../lib/motion.js";

export default function Hero({ productCount }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.from(".vp-letter", { yPercent: 105, duration: 1.1, ease: "power4.out", stagger: 0.06, delay: 0.1 });
      gsap.from(".hero-foot > *", { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.6 });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={rootRef}>
      <h1 className="hero-mark">
        <VariableProximity label="shopkart" from="'wght' 640, 'wdth' 75" to="'wght' 800, 'wdth' 100" radius={300} />
      </h1>

      <div className="hero-foot">
        <p className="hero-line">Headphones, hoodies, paperbacks and houseplants. One cart, one checkout.</p>
        <div className="hero-cta">
          <Link to="/products" className="btn btn-primary hero-button">
            Start shopping
          </Link>
          {productCount > 0 && <span className="hero-count">{productCount} products in stock</span>}
        </div>
      </div>
    </section>
  );
}

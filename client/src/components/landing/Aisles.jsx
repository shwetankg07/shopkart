import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// vertical scrolling drives a sideways track of category panels, each photo wipes open as it arrives
export default function Aisles({ aisles }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const track = root.querySelector(".aisles-track");
      const distance = () => track.scrollWidth - window.innerWidth;

      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      for (const panel of root.querySelectorAll(".aisle")) {
        const frame = panel.querySelector(".aisle-frame");
        const photo = panel.querySelector(".aisle-photo");

        gsap.fromTo(
          frame,
          { clipPath: "inset(0% 0% 0% 100%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: slide, start: "left 95%", end: "left 45%", scrub: true },
          }
        );
        gsap.fromTo(
          photo,
          { scale: 1.3 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: panel, containerAnimation: slide, start: "left 95%", end: "right 30%", scrub: true },
          }
        );
      }
    });

    return () => mm.revert();
  }, [aisles]);

  return (
    // gsap wraps a pinned element in a spacer div, this outer div is what react adds and removes, so it never loses track
    <div>
      <section className="aisles" ref={rootRef}>
        <div className="aisles-track">
          <div className="aisles-intro">
            <h2 className="aisles-title">Four aisles.</h2>
            <p className="aisles-lede">Keep scrolling to walk past them.</p>
          </div>

          {aisles.map((aisle, index) => (
            <Link to={`/products?category=${aisle.name}`} className={`aisle aisle-${index}`} key={aisle.name} data-cursor="Shop">
              <div className="aisle-frame">
                <img className="aisle-photo" src={aisle.image} alt="" />
              </div>
              <div className="aisle-text">
                <span className="aisle-count">{aisle.count} products</span>
                <h3 className="aisle-name">{aisle.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

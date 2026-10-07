import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion.js";

// React Bits "Image Trail", trimmed down: moving the pointer throws photos out behind it
const lerp = (a, b, n) => (1 - n) * a + n * b;

class Trail {
  constructor(container) {
    this.container = container;
    this.images = [...container.querySelectorAll(".it-img")].map((el) => ({
      el,
      inner: el.querySelector(".it-img-inner"),
      rect: el.getBoundingClientRect(),
    }));
    this.position = 0;
    this.zIndex = 1;
    this.threshold = 90;
    this.mouse = { x: 0, y: 0 };
    this.lastMouse = { x: 0, y: 0 };
    this.cacheMouse = { x: 0, y: 0 };
    this.frame = null;
    this.destroyed = false;

    this.onResize = () => {
      for (const img of this.images) {
        gsap.set(img.el, { scale: 1, x: 0, y: 0, opacity: 0 });
        img.rect = img.el.getBoundingClientRect();
      }
    };

    this.onMove = (event) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    this.onFirstMove = (event) => {
      this.onMove(event);
      this.cacheMouse = { ...this.mouse };
      this.frame = requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", this.onFirstMove);
    };

    window.addEventListener("resize", this.onResize);
    container.addEventListener("mousemove", this.onMove);
    container.addEventListener("mousemove", this.onFirstMove);
  }

  render() {
    if (this.destroyed) return;

    const distance = Math.hypot(this.mouse.x - this.lastMouse.x, this.mouse.y - this.lastMouse.y);
    this.cacheMouse.x = lerp(this.cacheMouse.x, this.mouse.x, 0.1);
    this.cacheMouse.y = lerp(this.cacheMouse.y, this.mouse.y, 0.1);

    if (distance > this.threshold) {
      this.showNext();
      this.lastMouse = { ...this.mouse };
    }

    this.frame = requestAnimationFrame(() => this.render());
  }

  showNext() {
    this.zIndex = this.zIndex + 1;
    this.position = (this.position + 1) % this.images.length;
    const img = this.images[this.position];
    gsap.killTweensOf(img.el);

    gsap
      .timeline()
      .fromTo(
        img.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndex,
          xPercent: 0,
          yPercent: 0,
          x: this.cacheMouse.x - img.rect.width / 2,
          y: this.cacheMouse.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mouse.x - img.rect.width / 2,
          y: this.mouse.y - img.rect.height / 2,
        },
        0
      )
      .fromTo(img.inner, { scale: 1.2 }, { duration: 0.4, ease: "power1", scale: 1 }, 0)
      .to(
        img.el,
        {
          duration: 0.7,
          ease: "power2",
          opacity: 0,
          scale: 0.25,
          xPercent: () => gsap.utils.random(-30, 30),
          yPercent: -200,
        },
        0.6
      );
  }

  destroy() {
    this.destroyed = true;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.onResize);
    this.container.removeEventListener("mousemove", this.onMove);
    this.container.removeEventListener("mousemove", this.onFirstMove);
    for (const img of this.images) gsap.killTweensOf(img.el);
  }
}

export default function ImageTrail({ items }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const trail = new Trail(containerRef.current);
    return () => trail.destroy();
  }, [items]);

  return (
    <div className="it" ref={containerRef} aria-hidden="true">
      {items.map((url) => (
        <div className="it-img" key={url}>
          <div className="it-img-inner" style={{ backgroundImage: `url(${url})` }} />
        </div>
      ))}
    </div>
  );
}

import { gsap } from "gsap";
import { prefersReducedMotion } from "./motion.js";

// copy the product photo, shrink it into the cart pill in the nav, then give the pill a bump
export const flyToCart = (image) => {
  const target = document.querySelector("[data-cart-target]");
  if (!image || !target || prefersReducedMotion()) return;

  const from = image.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const clone = image.cloneNode();
  clone.className = "fly";
  clone.style.left = `${from.left}px`;
  clone.style.top = `${from.top}px`;
  clone.style.width = `${from.width}px`;
  clone.style.height = `${from.height}px`;
  document.body.appendChild(clone);

  const moveX = to.left + to.width / 2 - (from.left + from.width / 2);
  const moveY = to.top + to.height / 2 - (from.top + from.height / 2);

  gsap
    .timeline({ onComplete: () => clone.remove() })
    .to(clone, { x: moveX, y: moveY, scale: 0.06, borderRadius: "50%", duration: 0.75, ease: "power3.in" })
    .to(clone, { opacity: 0, duration: 0.1 }, "-=0.1")
    .fromTo(target, { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 });
};

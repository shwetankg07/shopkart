import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { rupees } from "../../lib/format.js";

gsap.registerPlugin(ScrollTrigger);

const amount = (value) => Math.round(value).toLocaleString("en-IN");

// pinned while you scroll: each step wipes in a product photo, prints its line and adds it to the total
export default function PrintScene({ products }) {
  const rootRef = useRef(null);

  let grandTotal = 0;
  for (const product of products) {
    grandTotal = grandTotal + product.price;
  }

  useEffect(() => {
    const root = rootRef.current;

    // the total after each line, so the counter knows where every step starts and ends
    const totals = [];
    let running = 0;
    for (const product of products) {
      running = running + product.price;
      totals.push(running);
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const photos = root.querySelectorAll(".print-photo");
      const captions = root.querySelectorAll(".print-caption");
      const lines = root.querySelectorAll(".print-line");
      const totalEl = root.querySelector(".print-total");
      const stamp = root.querySelector(".print-stamp");
      const finale = root.querySelector(".print-finale");

      gsap.set(photos, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(photos[0], { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(captions, { autoAlpha: 0, yPercent: 100 });
      gsap.set(captions[0], { autoAlpha: 1, yPercent: 0 });
      gsap.set(lines, { autoAlpha: 0, y: -10 });
      gsap.set(stamp, { autoAlpha: 0, scale: 2.4, rotation: -20 });
      gsap.set(finale, { autoAlpha: 0, y: 20 });
      totalEl.textContent = "0";

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: `+=${products.length * 420}`,
          pin: true,
          scrub: 0.6,
        },
      });

      products.forEach((product, i) => {
        if (i > 0) {
          timeline
            .to(photos[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut" }, i)
            .to(captions[i - 1], { autoAlpha: 0, yPercent: -100, duration: 0.35 }, i)
            .to(captions[i], { autoAlpha: 1, yPercent: 0, duration: 0.35 }, i + 0.35);
        }

        let from = 0;
        if (i > 0) from = totals[i - 1];
        const counter = { value: from };

        timeline
          .to(lines[i], { autoAlpha: 1, y: 0, duration: 0.3 }, i + 0.35)
          .fromTo(
            counter,
            { value: from },
            {
              value: totals[i],
              duration: 0.45,
              ease: "none",
              onUpdate: () => {
                totalEl.textContent = amount(counter.value);
              },
            },
            i + 0.35
          );
      });

      timeline
        .to(stamp, { autoAlpha: 1, scale: 1, rotation: -6, duration: 0.35, ease: "power4.in" }, products.length + 0.1)
        .to(finale, { autoAlpha: 1, y: 0, duration: 0.4 }, ">")
        .to({}, { duration: 0.6 });

      // leaving this media query puts everything back, the total text included
      return () => {
        totalEl.textContent = amount(running);
      };
    });

    return () => mm.revert();
  }, [products]);

  return (
    // gsap wraps a pinned element in a spacer div, this outer div is what react adds and removes, so it never loses track
    <div>
      <section className="print" ref={rootRef}>
        <div className="print-copy">
          <h2 className="print-title">Watch a kart fill up.</h2>
          <p className="print-lede">Every line on this receipt is a real product in the store right now.</p>
          <div className="print-finale">
            <Link to="/products" className="btn btn-primary hero-button">
              Start your own receipt
            </Link>
          </div>
        </div>

        <div className="print-stage" data-cursor="Look">
          {products.map((product) => (
            <img className="print-photo" src={product.image} alt={product.name} key={product._id} />
          ))}
          <div className="print-captions">
            {products.map((product) => (
              <p className="print-caption" key={product._id}>
                <span>{product.name}</span>
                <span>{rupees(product.price)}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="receipt print-receipt">
          <div className="receipt-paper">
            <p className="receipt-shop">SHOPKART</p>
            <p className="receipt-meta">Till 01</p>
            <p className="receipt-rule" aria-hidden="true" />
            <ul className="receipt-lines">
              {products.map((product) => (
                <li className="receipt-line print-line" key={product._id}>
                  <span className="receipt-name">{product.name}</span>
                  <span className="receipt-qty">x1</span>
                  <span className="receipt-amount">{amount(product.price)}</span>
                </li>
              ))}
            </ul>
            <p className="receipt-rule" aria-hidden="true" />
            <p className="receipt-total">
              <span>TOTAL (INR)</span>
              <span className="print-total tick">{amount(grandTotal)}</span>
            </p>
            <p className="receipt-stamp print-stamp">PAID</p>
            <p className="receipt-thanks">THANK YOU FOR SHOPPING</p>
          </div>
        </div>
      </section>
    </div>
  );
}

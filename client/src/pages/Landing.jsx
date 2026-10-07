import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import ScrollVelocity from "../components/rb/ScrollVelocity.jsx";
import FlowingMenu from "../components/rb/FlowingMenu.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProducts } from "../services/api.js";
import { CATEGORIES } from "../lib/catalog.js";
import { TRAIL_PHOTOS } from "../lib/photos.js";
import { prefersReducedMotion } from "../lib/motion.js";
import "../components/rb/rb.css";
import "../components/ProductCard.css";
import "./Landing.css";

const HEADLINE = ["Fill", "the", "kart."];

export default function Landing() {
  const [products, setProducts] = useState([]);
  const heroRef = useRef(null);

  useEffect(() => {
    fetchProducts({})
      .then((res) => setProducts(res.data.products))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-word", { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.08, delay: 0.15 });
      gsap.from(".hero-side", { opacity: 0, y: 16, duration: 0.7, ease: "power3.out", delay: 0.45 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  let photos = TRAIL_PHOTOS;
  if (products.length > 0) {
    photos = products.map((product) => product.image);
  }

  const half = Math.ceil(photos.length / 2);
  const rows = [photos.slice(0, half), photos.slice(half)].map((list, index) => (
    <span className="strip" key={index}>
      {list.map((url) => (
        <img className="strip-img" src={url} alt="" key={url} loading="lazy" />
      ))}
    </span>
  ));

  const categories = CATEGORIES.map((category) => {
    const inCategory = products.filter((product) => product.category === category);
    let img = TRAIL_PHOTOS[0];
    if (inCategory.length > 0) img = inCategory[0].image;

    let meta = "Browse";
    if (products.length > 0) meta = `${inCategory.length} products`;

    return { text: category, meta, img, to: `/products?category=${category}` };
  });

  const newest = products.slice(0, 4);

  return (
    <>
      <section className="hero" ref={heroRef}>
        <h1 className="hero-title" aria-label="Fill the kart.">
          {HEADLINE.map((word) => (
            <span className="hero-mask" key={word} aria-hidden="true">
              <span className="hero-word">{word}</span>
            </span>
          ))}
        </h1>

        <div className="hero-side">
          <p>Headphones, hoodies, paperbacks and houseplants. One cart, one checkout.</p>
          <Link to="/products" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      </section>

      <ScrollVelocity rows={rows} velocity={28} />

      <section className="page landing-section">
        <h2 className="landing-heading">Shop by category</h2>
        <FlowingMenu items={categories} />
      </section>

      {newest.length > 0 && (
        <section className="page landing-section">
          <div className="landing-head">
            <h2 className="landing-heading">Just in</h2>
            <Link to="/products" className="landing-more">
              See all products
            </Link>
          </div>
          <div className="product-grid landing-grid">
            {newest.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

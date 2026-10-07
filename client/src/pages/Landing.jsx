import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "../components/landing/Hero.jsx";
import PrintScene from "../components/landing/PrintScene.jsx";
import Aisles from "../components/landing/Aisles.jsx";
import PriceRibbon from "../components/landing/PriceRibbon.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProducts } from "../services/api.js";
import { CATEGORIES } from "../lib/catalog.js";
import "../components/rb/rb.css";
import "../components/ProductCard.css";
import "../components/Receipt.css";
import "./Landing.css";

const FEATURED = [
  "Studio Over-Ear Headphones",
  "Red Running Shoes",
  "How Innovation Works",
  "Instant Film Camera",
  "Grey Desk Lamp",
  "Succulent in Pot",
];

// a fixed set reads best on the receipt, but if the admin changed the catalogue just take the first few
const pickFeatured = (products) => {
  const picked = [];
  for (const name of FEATURED) {
    const match = products.find((product) => product.name === name);
    if (match) picked.push(match);
  }
  if (picked.length < 4) return products.slice(0, 6);
  return picked;
};

export default function Landing() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchProducts({})
      .then((res) => {
        setProducts(res.data.products);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  // pinned sections measure the page, so measure again once fonts and products have settled
  useEffect(() => {
    if (status !== "ready") return;
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, [status]);

  // memoised so a re-render doesn't hand the pinned sections new arrays and rebuild their timelines
  const featured = useMemo(() => pickFeatured(products), [products]);

  const aisles = useMemo(() => {
    const list = [];
    for (const name of CATEGORIES) {
      const inAisle = products.filter((product) => product.category === name);
      if (inAisle.length > 0) {
        list.push({ name, count: inAisle.length, image: inAisle[0].image });
      }
    }
    return list;
  }, [products]);

  return (
    <>
      <Hero productCount={products.length} />

      {status === "error" && (
        <div className="page">
          <div className="state">
            <h2 className="state-title">The shelves didn't load.</h2>
            <p>The store is still there, the server just didn't answer in time.</p>
            <Link to="/products" className="btn btn-primary">
              Go to the shop
            </Link>
          </div>
        </div>
      )}

      {status === "ready" && products.length > 0 && (
        <>
          <PrintScene products={featured} />
          <Aisles aisles={aisles} />
          <PriceRibbon products={products} />

          <section className="page landing-new">
            <div className="landing-head">
              <h2 className="landing-heading">Just in</h2>
              <Link to="/products" className="landing-more">
                See all products
              </Link>
            </div>
            <div className="product-grid landing-grid">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

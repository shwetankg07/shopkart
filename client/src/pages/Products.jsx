import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { gsap } from "gsap";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProducts } from "../services/api.js";
import { prefersReducedMotion } from "../lib/motion.js";
import "./Products.css";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const gridRef = useRef(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetchProducts({ search, category, sort })
      .then((res) => {
        if (!active) return;
        setProducts(res.data.products);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [search, category, sort, attempt]);

  useEffect(() => {
    if (status !== "ready" || !gridRef.current || prefersReducedMotion()) return;
    const cards = gridRef.current.querySelectorAll(".pcard");
    gsap.from(cards, { y: 18, opacity: 0, duration: 0.45, ease: "power3.out", stagger: 0.035 });
  }, [status, products]);

  // filters live in the url, so a refresh or a shared link keeps them
  const updateFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearFilters = () => setSearchParams({}, { replace: true });

  let heading = "All products";
  if (category) heading = category;

  return (
    <div className="page shop">
      <SearchBar search={search} category={category} sort={sort} onChange={updateFilter} />

      <section className="shop-results" aria-live="polite">
        <header className="shop-head">
          <h1 className="page-title">{heading}</h1>
          {status === "ready" && (
            <p className="shop-count">
              {products.length} {products.length === 1 ? "product" : "products"}
              {search && ` matching "${search}"`}
            </p>
          )}
        </header>

        {status === "loading" && (
          <div className="product-grid" aria-label="Loading products">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div className="pcard-skeleton" key={n}>
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="state">
            <h2 className="state-title">Something went wrong while loading products.</h2>
            <p>Check your connection and try again.</p>
            <button type="button" className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>
              Try again
            </button>
          </div>
        )}

        {status === "ready" && products.length === 0 && (
          <div className="state">
            <h2 className="state-title">No products found.</h2>
            <p>Nothing matches these filters. Clear them to see the whole store.</p>
            <button type="button" className="btn btn-quiet" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {status === "ready" && products.length > 0 && (
          <div className="product-grid" ref={gridRef}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

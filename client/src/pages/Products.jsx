import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import SearchBar from "../components/SearchBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { fetchProducts } from "../services/api.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      fetchProducts({ search, category, sort })
        .then((res) => {
          if (active) setProducts(res.data.products);
        })
        .catch(() => {
          if (active) setError("Something went wrong while loading products.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, category, sort]);

  return (
    <>
      <Navbar />

      <div className="page">
        <h2>Products</h2>

        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        {loading && <p className="state">Loading products...</p>}

        {!loading && error && <p className="state error">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p className="state">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

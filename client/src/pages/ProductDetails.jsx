import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { fetchProductById } from "../services/api.js";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    fetchProductById(id)
      .then((res) => {
        if (active) setProduct(res.data.product);
      })
      .catch((err) => {
        if (!active) return;

        setError(
          err.response?.status === 404
            ? "Product not found."
            : "Something went wrong while loading this product."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <>
      <Navbar />

      <div className="page">
        <Link className="back-link" to="/products">
          Back to products
        </Link>

        {loading && <p className="state">Loading product...</p>}

        {!loading && error && <p className="state error">{error}</p>}

        {!loading && !error && product && (
          <div className="details">
            <img src={product.image} alt={product.name} />

            <div className="details-body">
              <h2>{product.name}</h2>
              <p className="muted">{product.category}</p>
              <p className="price">₹{product.price.toLocaleString("en-IN")}</p>

              <p className={product.stock > 0 ? "in-stock" : "out-stock"}>
                {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
              </p>

              <p>{product.description}</p>

              <button disabled={product.stock === 0}>Add to Cart</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

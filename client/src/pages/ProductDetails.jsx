import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TiltImage from "../components/TiltImage.jsx";
import StockLine from "../components/StockLine.jsx";
import AddToCartButton from "../components/AddToCartButton.jsx";
import WishlistButton from "../components/WishlistButton.jsx";
import { fetchProductById } from "../services/api.js";
import { rupees } from "../lib/format.js";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const imageRef = useRef(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetchProductById(id)
      .then((res) => {
        if (!active) return;
        setProduct(res.data.product);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        if (err.response && (err.response.status === 404 || err.response.status === 400)) {
          setStatus("missing");
        } else {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [id, attempt]);

  if (status === "loading") {
    return (
      <div className="page detail" aria-label="Loading product">
        <div className="skeleton detail-skeleton-image" />
        <div className="detail-info">
          <div className="skeleton" style={{ height: 48, width: "80%" }} />
          <div className="skeleton" style={{ height: 28, width: "30%" }} />
          <div className="skeleton" style={{ height: 90 }} />
        </div>
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Product not found.</h1>
          <p>It may have been removed, or the link is wrong.</p>
          <Link to="/products" className="btn btn-primary">
            Back to the shop
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Something went wrong while loading this product.</h1>
          <button type="button" className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page detail">
      <TiltImage src={product.image} alt={product.name} imageRef={imageRef} />

      <div className="detail-info">
        <Link to={`/products?category=${product.category}`} className="detail-category">
          {product.category}
        </Link>
        <h1 className="detail-name">{product.name}</h1>
        <p className="detail-price">{rupees(product.price)}</p>
        <StockLine stock={product.stock} />
        <p className="detail-description">{product.description}</p>

        <div className="detail-actions">
          <AddToCartButton product={product} imageRef={imageRef} className="btn btn-primary" />
          <WishlistButton product={product} withLabel />
        </div>

        <Link to="/products" className="detail-back">
          Back to all products
        </Link>
      </div>
    </div>
  );
}

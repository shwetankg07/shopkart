import { Link } from "react-router-dom";

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' fill='%239ca3af' font-family='sans-serif' font-size='22' text-anchor='middle'%3ENo image%3C/text%3E%3C/svg%3E";

const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_IMAGE;
};

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        onError={handleImageError}
      />

      <div className="product-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.category}</p>
        <p className="price">₹{product.price.toLocaleString("en-IN")}</p>

        <p className={product.stock > 0 ? "in-stock" : "out-stock"}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        <Link className="btn" to={`/products/${product._id}`}>
          View Details
        </Link>
      </div>
    </div>
  );
}

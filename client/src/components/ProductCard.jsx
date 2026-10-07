import { useRef } from "react";
import { Link } from "react-router-dom";
import StockLine from "./StockLine.jsx";
import WishlistButton from "./WishlistButton.jsx";
import AddToCartButton from "./AddToCartButton.jsx";
import { rupees } from "../lib/format.js";
import { showFallbackImage } from "../lib/catalog.js";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const link = `/products/${product._id}`;
  const imageRef = useRef(null);

  return (
    <article className="pcard">
      <Link to={link} className="pcard-stage" tabIndex={-1} aria-hidden="true">
        <img ref={imageRef} src={product.image} alt="" loading="lazy" onError={showFallbackImage} />
      </Link>
      <WishlistButton product={product} />

      <div className="pcard-body">
        <div className="pcard-top">
          <h3 className="pcard-name">
            <Link to={link}>{product.name}</Link>
          </h3>
          <span className="pcard-price">{rupees(product.price)}</span>
        </div>
        <p className="pcard-category">{product.category}</p>
        <StockLine stock={product.stock} />
        <div className="pcard-actions">
          <AddToCartButton product={product} imageRef={imageRef} className="btn btn-quiet pcard-add" />
          <Link to={link} className="pcard-details">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import StockLine from "../components/StockLine.jsx";
import AddToCartButton from "../components/AddToCartButton.jsx";
import { fetchWishlist, removeFromWishlist, errorMessage } from "../services/api.js";
import { forgetSaved } from "../store/wishlistSlice.js";
import { showToast } from "../store/uiSlice.js";
import { rupees } from "../lib/format.js";
import { showFallbackImage } from "../lib/catalog.js";
import "../components/ProductCard.css";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  // this page asks the server itself, the saved list is backend data, not app state
  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetchWishlist()
      .then((res) => {
        if (!active) return;
        setProducts(res.data.wishlist);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const handleRemoved = (productId) => {
    setProducts(products.filter((product) => product._id !== productId));
  };

  if (status === "loading") {
    return (
      <div className="page">
        <h1 className="page-title">Saved</h1>
        <p className="page-lede">Loading your wishlist…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Something went wrong.</h1>
          <p>We couldn't load your wishlist.</p>
          <button type="button" className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Your wishlist is empty.</h1>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Saved</h1>
      <p className="page-lede">
        {products.length} {products.length === 1 ? "product" : "products"} saved
      </p>

      <div className="product-grid saved-grid">
        {products.map((product) => (
          <SavedCard key={product._id} product={product} onRemoved={handleRemoved} />
        ))}
      </div>
    </div>
  );
}

function SavedCard({ product, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const imageRef = useRef(null);
  const dispatch = useDispatch();
  const link = `/products/${product._id}`;

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await removeFromWishlist(product._id);
      dispatch(forgetSaved(product._id));
      onRemoved(product._id);
    } catch (err) {
      dispatch(showToast(errorMessage(err, "Couldn't remove that. Try again.")));
      setRemoving(false);
    }
  };

  return (
    <article className="pcard">
      <Link to={link} className="pcard-stage" tabIndex={-1} aria-hidden="true">
        <img ref={imageRef} src={product.image} alt="" loading="lazy" onError={showFallbackImage} />
      </Link>
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
        <button type="button" className="pcard-remove" onClick={handleRemove} disabled={removing}>
          {removing ? "Removing…" : "Remove from wishlist"}
        </button>
      </div>
    </article>
  );
}

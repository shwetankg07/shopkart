import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changeQuantity, removeItem } from "../store/cartSlice.js";
import { showToast } from "../store/uiSlice.js";
import { rupees } from "../lib/format.js";
import { showFallbackImage } from "../lib/catalog.js";

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const busy = useSelector((state) => state.cart.busyIds.includes(product._id));
  const dispatch = useDispatch();

  const setQuantity = async (next) => {
    const result = await dispatch(changeQuantity({ productId: product._id, quantity: next }));
    if (changeQuantity.rejected.match(result)) dispatch(showToast(result.payload));
  };

  const remove = async () => {
    const result = await dispatch(removeItem(product._id));
    if (removeItem.rejected.match(result)) dispatch(showToast(result.payload));
  };

  return (
    <li className={busy ? "cart-item is-busy" : "cart-item"}>
      <Link to={`/products/${product._id}`} className="cart-thumb">
        <img src={product.image} alt="" onError={showFallbackImage} />
      </Link>

      <div className="cart-info">
        <Link to={`/products/${product._id}`} className="cart-name">
          {product.name}
        </Link>
        <p className="cart-unit">{rupees(product.price)} each</p>
        {quantity >= product.stock && <p className="cart-limit">That's all we have in stock.</p>}
      </div>

      <div className="stepper" aria-label={`Quantity of ${product.name}`}>
        <button
          type="button"
          onClick={() => setQuantity(quantity - 1)}
          disabled={busy || quantity <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span aria-live="polite">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          disabled={busy || quantity >= product.stock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <p className="cart-line-total">{rupees(product.price * quantity)}</p>

      <button type="button" className="cart-remove" onClick={remove} disabled={busy}>
        Remove
      </button>
    </li>
  );
}

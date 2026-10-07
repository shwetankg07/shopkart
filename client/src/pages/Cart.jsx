import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadCart, selectCartCount, selectSubtotal } from "../store/cartSlice.js";
import CartItem from "../components/CartItem.jsx";
import Receipt from "../components/Receipt.jsx";
import "./Cart.css";

export default function Cart() {
  const items = useSelector((state) => state.cart.items);
  const status = useSelector((state) => state.cart.status);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectSubtotal);
  const dispatch = useDispatch();

  // prices and stock can change while the cart sits there, so refresh on every visit
  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  if (status === "error") {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Unable to load your cart.</h1>
          <button type="button" className="btn btn-primary" onClick={() => dispatch(loadCart())}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && status !== "ready") {
    return (
      <div className="page">
        <h1 className="page-title">Your cart</h1>
        <p className="page-lede">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Your cart is empty.</h1>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const lines = items.map((item) => ({
    key: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    amount: item.product.price * item.quantity,
  }));

  return (
    <div className="page cart">
      <section>
        <h1 className="page-title">Your cart</h1>
        <p className="page-lede">
          {count} {count === 1 ? "item" : "items"}
        </p>
        <ul className="cart-list">
          {items.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </ul>
      </section>

      <aside className="cart-side" aria-label="Order summary">
        <Receipt
          lines={lines}
          meta="Order summary"
          rows={[
            { label: "Items", value: count },
            { label: "Subtotal", value: subtotal.toLocaleString("en-IN") },
            { label: "Delivery", value: "FREE" },
          ]}
          total={subtotal}
        />
        <Link to="/checkout" className="btn btn-primary btn-block cart-checkout">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}

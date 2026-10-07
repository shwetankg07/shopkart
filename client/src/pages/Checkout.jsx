import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Receipt from "../components/Receipt.jsx";
import { loadCart, clearCart, selectCartCount, selectSubtotal } from "../store/cartSlice.js";
import { createPaymentOrder, verifyPayment, errorMessage } from "../services/api.js";
import { loadRazorpay } from "../lib/razorpay.js";
import { rupees } from "../lib/format.js";
import "./Checkout.css";

const FIELDS = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Phone", autoComplete: "tel", inputMode: "numeric" },
  { name: "addressLine1", label: "Address", autoComplete: "address-line1", wide: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", autoComplete: "postal-code", inputMode: "numeric" },
];

const validate = (address) => {
  const errors = {};

  for (const field of FIELDS) {
    if (address[field.name].trim() === "") {
      errors[field.name] = `${field.label} is required.`;
    }
  }

  if (!errors.phone && !/^[0-9]{10}$/.test(address.phone.trim())) {
    errors.phone = "Phone number should be 10 digits.";
  }

  if (!errors.pincode && !/^[0-9]{6}$/.test(address.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits.";
  }

  return errors;
};

const STEP_LABELS = {
  idle: "",
  preparing: "Preparing payment…",
  paying: "Waiting for payment…",
  confirming: "Confirming payment…",
};

export default function Checkout() {
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items);
  const cartStatus = useSelector((state) => state.cart.status);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user.fullName,
    phone: user.phone,
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("idle");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    dispatch(loadCart());
  }, [dispatch]);

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const fail = (message) => {
    setProblem(message);
    setStep("idle");
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setProblem("");

    const found = validate(address);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStep("preparing");

    const scriptReady = await loadRazorpay();
    if (!scriptReady) {
      fail("Couldn't load the payment window. Check your connection and try again.");
      return;
    }

    let data;
    try {
      // only the address goes up. the server works out items, prices and the total itself
      const res = await createPaymentOrder(address);
      data = res.data;
    } catch (err) {
      fail(errorMessage(err, "Couldn't start the payment. Try again."));
      dispatch(loadCart());
      return;
    }

    const payment = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpayOrderId,
      name: "ShopKart",
      description: `Order of ${count} ${count === 1 ? "item" : "items"}`,
      prefill: { name: address.fullName, contact: address.phone, email: user.email },
      theme: { color: "#2b4cff" },
      modal: {
        ondismiss: () => fail("Payment cancelled. Your cart is still here."),
      },
      // razorpay calling this doesn't prove anything yet, the server checks the signature first
      handler: async (response) => {
        setStep("confirming");
        try {
          const res = await verifyPayment({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          dispatch(clearCart());
          navigate(`/order-success/${res.data.order._id}`);
        } catch (err) {
          fail(errorMessage(err, "We couldn't confirm the payment. Your cart has not been cleared."));
        }
      },
    });

    payment.on("payment.failed", () => {
      fail("Payment failed. Your cart has not been cleared. Please try again.");
    });

    setStep("paying");
    payment.open();
  };

  if (items.length === 0 && cartStatus !== "ready") {
    return (
      <div className="page">
        <h1 className="page-title">Checkout</h1>
        <p className="page-lede">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Nothing to check out.</h1>
          <p>Your cart is empty. Add something first.</p>
          <Link to="/products" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const busy = step !== "idle";
  const lines = items.map((item) => ({
    key: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    amount: item.product.price * item.quantity,
  }));

  return (
    <form className="page checkout" onSubmit={handlePay} noValidate>
      <section>
        <h1 className="page-title">Checkout</h1>
        <p className="page-lede">Where should we deliver it?</p>

        <fieldset className="checkout-fields" disabled={busy}>
          <legend className="sr-only">Shipping details</legend>
          {FIELDS.map((field) => (
            <label className={field.wide ? "field checkout-wide" : "field"} key={field.name}>
              <span className="field-label">{field.label}</span>
              <input
                className="field-input"
                name={field.name}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                value={address[field.name]}
                onChange={handleChange}
                aria-invalid={errors[field.name] ? "true" : "false"}
              />
              {errors[field.name] && <span className="field-error">{errors[field.name]}</span>}
            </label>
          ))}
        </fieldset>
      </section>

      <aside className="checkout-side" aria-label="Order summary">
        <Receipt
          lines={lines}
          meta="Final check"
          rows={[
            { label: "Items", value: count },
            { label: "Delivery", value: "FREE" },
          ]}
          total={subtotal}
        />

        {problem && (
          <p className="notice notice-error" role="alert">
            {problem}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block checkout-pay" disabled={busy}>
          {busy ? STEP_LABELS[step] : `Pay ${rupees(subtotal)}`}
        </button>
        <p className="checkout-note">Razorpay test mode. Use a test card or UPI, no real money is charged.</p>
      </aside>
    </form>
  );
}

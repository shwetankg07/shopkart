import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { gsap } from "gsap";
import Receipt from "../components/Receipt.jsx";
import { fetchOrder } from "../services/api.js";
import { rupees, shortId, formatDate } from "../lib/format.js";
import { prefersReducedMotion } from "../lib/motion.js";
import "./Orders.css";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [failed, setFailed] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    fetchOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch(() => setFailed(true));
  }, [id]);

  useEffect(() => {
    if (!order || prefersReducedMotion()) return;

    const receipt = receiptRef.current;
    const stamp = receipt.querySelector(".receipt-stamp");

    const t = gsap.timeline({ delay: 0.2 });
    t.fromTo(
      receipt,
      { clipPath: "inset(-16px -16px 100% -16px)" },
      { clipPath: "inset(-16px -16px -16px -16px)", duration: 1.8, ease: "steps(16)" }
    ).fromTo(
      stamp,
      { scale: 2.4, opacity: 0, rotation: -18 },
      { scale: 1, opacity: 1, rotation: -6, duration: 0.35, ease: "power4.in" },
      "-=0.5"
    );

    return () => t.kill();
  }, [order]);

  if (failed) {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">We couldn't load this order.</h1>
          <p>If you were charged, the order is safe. It will show up in your orders.</p>
          <Link to="/orders" className="btn btn-primary">
            Go to your orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page">
        <p className="page-lede">Loading your order…</p>
      </div>
    );
  }

  const lines = order.items.map((item) => ({
    key: item.product,
    name: item.name,
    quantity: item.quantity,
    amount: item.price * item.quantity,
  }));

  return (
    <div className="page success">
      <section>
        <h1 className="success-title">Order placed.</h1>
        <p className="page-lede">Your order has been saved and the payment is confirmed.</p>

        <div className="success-facts">
          <p>
            Order ID <strong>#{shortId(order._id)}</strong>
          </p>
          <p>
            Total <strong>{rupees(order.totalAmount)}</strong>
          </p>
          <p>
            Status <strong>{order.status}</strong>
          </p>
        </div>

        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">
            View my orders
          </Link>
          <Link to="/products" className="btn btn-quiet">
            Continue shopping
          </Link>
        </div>
      </section>

      <Receipt
        receiptRef={receiptRef}
        lines={lines}
        meta={`Order #${shortId(order._id)}\n${formatDate(order.createdAt)}`}
        rows={[{ label: "Paid by", value: "Razorpay" }]}
        total={order.totalAmount}
        stamp="PAID"
      />
    </div>
  );
}

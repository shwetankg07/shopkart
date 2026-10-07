import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Receipt from "../components/Receipt.jsx";
import StatusTracker from "../components/StatusTracker.jsx";
import { fetchOrder } from "../services/api.js";
import { shortId, formatDate } from "../lib/format.js";
import "./Orders.css";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    fetchOrder(id)
      .then((res) => {
        if (!active) return;
        setOrder(res.data.order);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("missing");
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="page">
        <p className="page-lede">Loading order…</p>
      </div>
    );
  }

  if (status === "missing") {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Order not found.</h1>
          <p>It doesn't exist, or it belongs to a different account.</p>
          <Link to="/orders" className="btn btn-primary">
            Back to your orders
          </Link>
        </div>
      </div>
    );
  }

  const address = order.shippingAddress;
  const lines = order.items.map((item) => ({
    key: item.product,
    name: item.name,
    quantity: item.quantity,
    amount: item.price * item.quantity,
  }));

  return (
    <div className="page order-detail">
      <section>
        <Link to="/orders" className="detail-back">
          All orders
        </Link>
        <h1 className="page-title">Order #{shortId(order._id)}</h1>
        <p className="page-lede">Placed on {formatDate(order.createdAt)}</p>

        <div className="order-block">
          <h2>Progress</h2>
          <StatusTracker status={order.status} />
        </div>

        <div className="order-block">
          <h2>Delivering to</h2>
          <p className="order-address">
            {address.fullName}
            <br />
            {address.addressLine1}
            <br />
            {address.city}, {address.state} {address.pincode}
            <br />
            {address.phone}
          </p>
        </div>

        <div className="order-block">
          <h2>Payment</h2>
          <p className="order-meta">Razorpay payment {order.razorpayPaymentId}</p>
        </div>
      </section>

      <Receipt
        lines={lines}
        meta={`Order #${shortId(order._id)}`}
        rows={[{ label: "Paid by", value: "Razorpay" }]}
        total={order.totalAmount}
        stamp={order.paymentStatus}
      />
    </div>
  );
}

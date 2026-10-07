import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusTracker from "../components/StatusTracker.jsx";
import { fetchOrders } from "../services/api.js";
import { rupees, shortId, formatDate } from "../lib/format.js";
import "./Orders.css";

const summarise = (items) => {
  const parts = items.map((item) => `${item.name} x${item.quantity}`);
  return parts.join(", ");
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");

    fetchOrders()
      .then((res) => {
        if (!active) return;
        setOrders(res.data.orders);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  if (status === "loading") {
    return (
      <div className="page">
        <h1 className="page-title">Your orders</h1>
        <p className="page-lede">Loading your orders…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">Unable to load your orders.</h1>
          <button type="button" className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page">
        <div className="state">
          <h1 className="state-title">You have not placed any orders yet.</h1>
          <p>Once you check out, your orders and their progress show up here.</p>
          <Link to="/products" className="btn btn-primary">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Your orders</h1>
      <p className="page-lede">Newest first.</p>

      <ul className="order-list">
        {orders.map((order) => (
          <li className="order-row" key={order._id}>
            <div>
              <p className="order-id">#{shortId(order._id)}</p>
              <p className="order-date">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <StatusTracker status={order.status} />
              <p className="order-items">{summarise(order.items)}</p>
            </div>
            <p className="order-total">{rupees(order.totalAmount)}</p>
            <Link to={`/orders/${order._id}`} className="order-link">
              View details
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

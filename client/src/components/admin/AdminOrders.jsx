import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchAllOrders, updateOrderStatus, errorMessage } from "../../services/api.js";
import { showToast } from "../../store/uiSlice.js";
import { rupees, shortId, formatDate } from "../../lib/format.js";

const STATUSES = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [savingId, setSavingId] = useState(null);
  const dispatch = useDispatch();

  const load = () => {
    fetchAllOrders()
      .then((res) => {
        setOrders(res.data.orders);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleStatus = async (order, next) => {
    setSavingId(order._id);
    try {
      const res = await updateOrderStatus(order._id, next);
      setOrders(orders.map((item) => (item._id === order._id ? { ...item, status: res.data.order.status } : item)));
      dispatch(showToast(`Order #${shortId(order._id)} is now ${next.toLowerCase()}.`));
    } catch (err) {
      dispatch(showToast(errorMessage(err, "Couldn't update the order.")));
    }
    setSavingId(null);
  };

  if (status === "loading") return <p className="page-lede">Loading orders…</p>;

  if (status === "error") {
    return (
      <p className="notice notice-error">
        Couldn't load orders.{" "}
        <button type="button" className="admin-link" onClick={load}>
          Try again
        </button>
      </p>
    );
  }

  if (orders.length === 0) {
    return <p className="page-lede">No paid orders yet. They show up here once a customer checks out.</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Placed</th>
            <th scope="col" className="num">
              Total
            </th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="admin-strong">#{shortId(order._id)}</td>
              <td>
                {order.user ? order.user.fullName : "Deleted account"}
                {order.user && <span className="admin-sub">{order.user.email}</span>}
              </td>
              <td>{formatDate(order.createdAt)}</td>
              <td className="num">{rupees(order.totalAmount)}</td>
              <td>
                <select
                  className="field-input admin-status"
                  value={order.status}
                  disabled={savingId === order._id}
                  onChange={(e) => handleStatus(order, e.target.value)}
                  aria-label={`Status of order ${shortId(order._id)}`}
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0) + item.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from "react";
import AdminProducts from "../components/admin/AdminProducts.jsx";
import AdminOrders from "../components/admin/AdminOrders.jsx";
import "./Admin.css";

export default function Admin() {
  const [tab, setTab] = useState("products");

  return (
    <div className="page admin">
      <h1 className="page-title">Admin</h1>

      <div className="admin-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "products"}
          className={tab === "products" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setTab("products")}
        >
          Products
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "orders"}
          className={tab === "orders" ? "admin-tab is-active" : "admin-tab"}
          onClick={() => setTab("orders")}
        >
          Orders
        </button>
      </div>

      {tab === "products" ? <AdminProducts /> : <AdminOrders />}
    </div>
  );
}

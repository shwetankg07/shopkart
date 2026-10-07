import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getMe } from "../services/api.js";

export default function Home() {
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe()
      .then((res) => setCustomer(res.data))
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!customer) return <p className="card">Loading...</p>;

  return (
    <>
      <Navbar />

      <div className="card">
        <h2>Welcome, {customer.fullName} 👋</h2>
        <p>Email: {customer.email}</p>
        <p>Phone: {customer.phone}</p>

        <Link className="btn" to="/products">
          Browse Products
        </Link>
      </div>
    </>
  );
}

import { useNavigate, Link } from "react-router-dom";
import { logoutCustomer } from "../services/api.js";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutCustomer();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <strong>ShopKart</strong>

      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutCustomer } from "../services/api.js";
import { clearUser } from "../store/authSlice.js";
import { selectCartCount } from "../store/cartSlice.js";
import { firstName } from "../lib/format.js";
import "./Navbar.css";

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector(selectCartCount);
  const savedCount = useSelector((state) => state.wishlist.ids.length);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // the cookie might already be gone, log out locally either way
    }
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <header className={scrolled ? "nav nav-scrolled" : "nav"}>
      <Link to="/" className="nav-mark">
        shopkart
      </Link>

      <nav className="nav-links" aria-label="Main">
        <NavLink to="/products">Shop</NavLink>
        <NavLink to="/wishlist">
          Saved{savedCount > 0 && <span className="nav-saved"> ({savedCount})</span>}
        </NavLink>
        <NavLink to="/orders">Orders</NavLink>
        {user && user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
      </nav>

      <div className="nav-end">
        {user ? (
          <>
            <NavLink to="/home" className="nav-account">
              {firstName(user.fullName)}
            </NavLink>
            <button type="button" className="nav-logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <NavLink to="/login">Log in</NavLink>
        )}

        <NavLink to="/cart" className="nav-cart" data-cart-target aria-label={`Cart, ${cartCount} items`}>
          Cart
          {cartCount > 0 && <span className="nav-count">{cartCount}</span>}
        </NavLink>
      </div>
    </header>
  );
}

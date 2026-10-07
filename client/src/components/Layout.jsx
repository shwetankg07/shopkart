import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import useSmoothScroll from "../lib/useSmoothScroll.js";
import "./Layout.css";

export default function Layout() {
  useSmoothScroll();

  return (
    <div className="shell">
      <Navbar />
      <main className="shell-main">
        <Outlet />
      </main>
      <footer className="footer">
        <span className="footer-mark">shopkart</span>
        <p>Payments run in Razorpay test mode. No real money moves.</p>
      </footer>
    </div>
  );
}

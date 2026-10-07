import { Link } from "react-router-dom";
import ImageTrail from "./rb/ImageTrail.jsx";
import { TRAIL_PHOTOS } from "../lib/photos.js";
import "./rb/rb.css";
import "./AuthShell.css";

export default function AuthShell({ title, line, children }) {
  return (
    <div className="auth">
      <section className="auth-form-side">
        <Link to="/" className="auth-mark">
          shopkart
        </Link>
        <div className="auth-form-wrap">
          <h1 className="auth-title">{title}</h1>
          {children}
        </div>
      </section>

      <section className="auth-stage">
        <ImageTrail items={TRAIL_PHOTOS} />
        <p className="auth-line">{line}</p>
      </section>
    </div>
  );
}

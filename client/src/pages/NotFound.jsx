import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <div className="state">
        <h1 className="state-title">This page doesn't exist.</h1>
        <p>The link might be old, or there's a typo in the address.</p>
        <Link to="/products" className="btn btn-primary">
          Go to the shop
        </Link>
      </div>
    </div>
  );
}

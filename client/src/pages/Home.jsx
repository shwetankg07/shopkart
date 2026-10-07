import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe, changePassword, errorMessage } from "../services/api.js";
import { setUser } from "../store/authSlice.js";
import { firstName } from "../lib/format.js";
import "./Home.css";

export default function Home() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // ask the server again on every visit, it's the only one that really knows who the cookie belongs to
  useEffect(() => {
    getMe()
      .then((res) => dispatch(setUser(res.data)))
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="page account">
      <h1 className="account-title">Hi, {firstName(user.fullName)}.</h1>

      <div className="account-grid">
        <section>
          <h2 className="account-heading">Your details</h2>
          <dl className="account-details">
            <div>
              <dt>Name</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user.phone}</dd>
            </div>
          </dl>

          <div className="account-links">
            <Link to="/products" className="btn btn-primary">
              Browse products
            </Link>
            <Link to="/orders" className="btn btn-quiet">
              Your orders
            </Link>
            <Link to="/wishlist" className="btn btn-quiet">
              Saved items
            </Link>
          </div>
        </section>

        <PasswordForm />
      </div>
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (form.newPassword.length < 6) {
      setMessage({ type: "error", text: "New password needs at least 6 characters." });
      return;
    }

    setSaving(true);
    try {
      await changePassword(form);
      setMessage({ type: "success", text: "Password changed." });
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err, "Couldn't change the password.") });
    }
    setSaving(false);
  };

  return (
    <section>
      <h2 className="account-heading">Change password</h2>
      <form className="account-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span className="field-label">Current password</span>
          <input
            className="field-input"
            type="password"
            name="oldPassword"
            autoComplete="current-password"
            value={form.oldPassword}
            onChange={handleChange}
          />
        </label>
        <label className="field">
          <span className="field-label">New password</span>
          <input
            className="field-input"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={handleChange}
          />
        </label>

        {message && <p className={`notice notice-${message.type}`}>{message.text}</p>}

        <button type="submit" className="btn btn-quiet" disabled={saving}>
          {saving ? "Saving…" : "Change password"}
        </button>
      </form>
    </section>
  );
}

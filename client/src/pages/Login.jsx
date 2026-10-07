import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthShell from "../components/AuthShell.jsx";
import { loginCustomer, errorMessage } from "../services/api.js";
import { setUser } from "../store/authSlice.js";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  let justRegistered = false;
  let goTo = "/home";
  if (location.state) {
    justRegistered = Boolean(location.state.registered);
    if (location.state.from) goTo = location.state.from;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await loginCustomer(form);
      dispatch(setUser(res.data.customer));
      navigate(goTo);
    } catch (err) {
      setError(errorMessage(err, "Invalid credentials"));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell title="Log in" line="Everything you saved is still here.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {justRegistered && <p className="notice notice-success">Account created. Log in to start shopping.</p>}

        <label className="field">
          <span className="field-label">Email</span>
          <input
            className="field-input"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            className="field-input"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        New to ShopKart? <Link to="/register">Create an account</Link>
      </p>
    </AuthShell>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerCustomer } from "../services/api.js";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerCustomer(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create your ShopKart account</h2>

      <input name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} minLength={6} required />
      <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required />

      {error && <p className="error">{error}</p>}

      <button type="submit">Create Account</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}

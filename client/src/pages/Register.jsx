import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { registerCustomer, errorMessage } from "../services/api.js";

const validate = (form) => {
  const errors = {};

  if (form.fullName.trim() === "") {
    errors.fullName = "Enter your name.";
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (form.password.length < 6) {
    errors.password = "Use at least 6 characters.";
  }

  if (!/^[0-9]{10}$/.test(form.phone.trim())) {
    errors.phone = "Phone number should be 10 digits.";
  }

  return errors;
};

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);

    try {
      await registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(errorMessage(err, "Couldn't create the account. Try again."));
      setSubmitting(false);
    }
  };

  const fields = [
    { name: "fullName", label: "Full name", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", autoComplete: "new-password", hint: "At least 6 characters." },
    { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
  ];

  return (
    <AuthShell title="Create an account" line="Your kart starts here.">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <label className="field" key={field.name}>
            <span className="field-label">{field.label}</span>
            <input
              className="field-input"
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              value={form[field.name]}
              onChange={handleChange}
              aria-invalid={errors[field.name] ? "true" : "false"}
            />
            {errors[field.name] ? (
              <span className="field-error">{errors[field.name]}</span>
            ) : (
              field.hint && <span className="field-hint">{field.hint}</span>
            )}
          </label>
        ))}

        {serverError && (
          <p className="notice notice-error" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthShell>
  );
}

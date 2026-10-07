import { useEffect, useState } from "react";
import { CATEGORIES } from "../../lib/catalog.js";

const EMPTY = { name: "", description: "", price: "", category: CATEGORIES[0], stock: "", image: "" };

const validate = (form, file, editing) => {
  const errors = {};

  if (form.name.trim() === "") errors.name = "Name is required.";
  if (form.description.trim() === "") errors.description = "Description is required.";

  if (!(Number(form.price) > 0)) errors.price = "Price must be greater than 0.";

  if (form.stock === "" || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
    errors.stock = "Stock must be a whole number, 0 or more.";
  }

  if (!editing && !file && form.image.trim() === "") {
    errors.image = "Upload a photo or paste an image link.";
  }

  if (file && file.size > 5 * 1024 * 1024) errors.image = "Image must be 5MB or smaller.";

  return errors;
};

export default function ProductForm({ editing, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description || "",
        price: String(editing.price),
        category: editing.category,
        stock: String(editing.stock),
        image: "",
      });
      setPreview(editing.image);
    } else {
      setForm(EMPTY);
      setPreview("");
    }
    setFile(null);
    setErrors({});
    setMessage(null);
  }, [editing]);

  // object urls hold memory until revoked
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const picked = e.target.files[0];
    if (picked) setFile(picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const found = validate(form, file, Boolean(editing));
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("description", form.description.trim());
    data.append("price", form.price);
    data.append("category", form.category);
    data.append("stock", form.stock);
    if (file) {
      data.append("image", file);
    } else if (form.image.trim() !== "") {
      data.append("image", form.image.trim());
    }

    setSaving(true);
    const error = await onSubmit(data);
    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setMessage({ type: "success", text: editing ? "Product updated." : "Product added." });
    if (!editing) {
      setForm(EMPTY);
      setFile(null);
      setPreview("");
    }
  };

  let submitText = "Add product";
  if (editing) submitText = "Save changes";
  if (saving) submitText = "Saving…";

  const fieldError = (name) => errors[name] && <span className="field-error">{errors[name]}</span>;

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h2 className="admin-heading">{editing ? `Edit ${editing.name}` : "Add a product"}</h2>

      <label className="field">
        <span className="field-label">Name</span>
        <input className="field-input" name="name" value={form.name} onChange={handleChange} />
        {fieldError("name")}
      </label>

      <label className="field">
        <span className="field-label">Description</span>
        <textarea className="field-input" name="description" value={form.description} onChange={handleChange} />
        {fieldError("description")}
      </label>

      <div className="admin-row">
        <label className="field">
          <span className="field-label">Price (₹)</span>
          <input className="field-input" name="price" inputMode="decimal" value={form.price} onChange={handleChange} />
          {fieldError("price")}
        </label>
        <label className="field">
          <span className="field-label">Stock</span>
          <input className="field-input" name="stock" inputMode="numeric" value={form.stock} onChange={handleChange} />
          {fieldError("stock")}
        </label>
      </div>

      <label className="field">
        <span className="field-label">Category</span>
        <select className="field-input" name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </label>

      <div className="field">
        <span className="field-label">Photo</span>
        <div className="admin-photo">
          <div className="admin-preview">{preview ? <img src={preview} alt="" /> : <span>No photo yet</span>}</div>
          <div className="admin-photo-inputs">
            <label className="btn btn-quiet admin-upload">
              {file ? "Choose another" : "Upload photo"}
              <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
            </label>
            <input
              className="field-input"
              name="image"
              placeholder="or paste an image link"
              value={form.image}
              onChange={handleChange}
              disabled={Boolean(file)}
            />
            <span className="field-hint">Uploads go to Cloudinary. 5MB max.</span>
          </div>
        </div>
        {fieldError("image")}
      </div>

      {message && <p className={`notice notice-${message.type}`}>{message.text}</p>}

      <div className="admin-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {submitText}
        </button>
        {editing && (
          <button type="button" className="btn btn-quiet" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

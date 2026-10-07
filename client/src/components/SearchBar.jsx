import { useEffect, useRef, useState } from "react";
import { CATEGORIES, SORTS } from "../lib/catalog.js";

export default function SearchBar({ search, category, sort, onChange }) {
  const [text, setText] = useState(search);
  const sent = useRef(search);

  // the url changed without us typing (clear filters, back button), so show what it says now
  useEffect(() => {
    if (search !== sent.current) {
      sent.current = search;
      setText(search);
    }
  }, [search]);

  // wait until typing pauses before asking the server
  useEffect(() => {
    const value = text.trim();
    if (value === sent.current) return;

    const timer = setTimeout(() => {
      sent.current = value;
      onChange("search", value);
    }, 300);
    return () => clearTimeout(timer);
  }, [text, onChange]);

  return (
    <aside className="filters" aria-label="Filter products">
      <label className="field">
        <span className="field-label">Search</span>
        <input
          className="field-input"
          type="search"
          placeholder="Lamp, hoodie, keyboard"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>

      <div className="filters-group">
        <span className="field-label">Category</span>
        <ul className="filters-list">
          <li>
            <button
              type="button"
              className={category === "" ? "filters-option is-active" : "filters-option"}
              aria-pressed={category === ""}
              onClick={() => onChange("category", "")}
            >
              All products
            </button>
          </li>
          {CATEGORIES.map((item) => (
            <li key={item}>
              <button
                type="button"
                className={category === item ? "filters-option is-active" : "filters-option"}
                aria-pressed={category === item}
                onClick={() => onChange("category", item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <label className="field">
        <span className="field-label">Sort</span>
        <select className="field-input" value={sort} onChange={(e) => onChange("sort", e.target.value)}>
          {SORTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}

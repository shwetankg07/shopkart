export const CATEGORIES = ["Electronics", "Fashion", "Books", "Home"];

export const SORTS = [
  { value: "", label: "Newest first" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
];

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='750'%3E%3Crect width='600' height='750' fill='%23eceef2'/%3E%3C/svg%3E";

export const showFallbackImage = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};

export default function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M12 20.3 4.9 13.4a4.6 4.6 0 0 1 0-6.6 4.7 4.7 0 0 1 6.6 0l.5.5.5-.5a4.7 4.7 0 0 1 6.6 0 4.6 4.6 0 0 1 0 6.6Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

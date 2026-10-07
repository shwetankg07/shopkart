const STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const LABELS = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export default function StatusTracker({ status }) {
  const current = STEPS.indexOf(status);

  return (
    <ol className="tracker" aria-label={`Order status: ${LABELS[status] || status}`}>
      {STEPS.map((step, index) => {
        let className = "tracker-step";
        if (index <= current) className = "tracker-step is-done";
        if (index === current) className = "tracker-step is-done is-current";

        return (
          <li className={className} key={step}>
            <span className="tracker-dot" aria-hidden="true" />
            <span className="tracker-label">{LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}

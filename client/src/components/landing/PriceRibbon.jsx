import ScrollVelocity from "../rb/ScrollVelocity.jsx";
import { rupees } from "../../lib/format.js";

export default function PriceRibbon({ products }) {
  const prices = (
    <span className="ribbon ribbon-prices">
      {products.map((product) => (
        <span key={product._id}>{rupees(product.price)}</span>
      ))}
    </span>
  );

  const names = (
    <span className="ribbon ribbon-names">
      {products.map((product) => (
        <span key={product._id}>{product.name}</span>
      ))}
    </span>
  );

  return (
    <section className="ribbons">
      <ScrollVelocity rows={[prices, names]} velocity={60} />
    </section>
  );
}

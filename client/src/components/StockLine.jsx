export default function StockLine({ stock }) {
  if (stock === 0) {
    return <p className="stock stock-out">Sold out</p>;
  }

  if (stock <= 5) {
    return <p className="stock stock-low">Only {stock} left</p>;
  }

  return <p className="stock">{stock} left</p>;
}

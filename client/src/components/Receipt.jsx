import TickingNumber from "./TickingNumber.jsx";
import "./Receipt.css";

export default function Receipt({ lines, rows, total, meta, stamp, receiptRef }) {
  return (
    <div className="receipt" ref={receiptRef}>
      <div className="receipt-paper">
        <p className="receipt-shop">SHOPKART</p>
        {meta && <p className="receipt-meta">{meta}</p>}

        <p className="receipt-rule" aria-hidden="true" />

        <ul className="receipt-lines">
          {lines.map((line) => (
            <li className="receipt-line" key={line.key}>
              <span className="receipt-name">{line.name}</span>
              <span className="receipt-qty">x{line.quantity}</span>
              <span className="receipt-amount">{line.amount.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>

        <p className="receipt-rule" aria-hidden="true" />

        {rows &&
          rows.map((row) => (
            <p className="receipt-row" key={row.label}>
              <span>{row.label}</span>
              <span>{row.value}</span>
            </p>
          ))}

        <p className="receipt-total">
          <span>TOTAL (INR)</span>
          <TickingNumber value={total} />
        </p>

        {stamp && <p className="receipt-stamp">{stamp}</p>}
        <p className="receipt-thanks">THANK YOU FOR SHOPPING</p>
      </div>
    </div>
  );
}

import React from "react";
import "./CreditLimitPopup.css";

function CreditLimitPopup({
  open,
  onClose,
  creditLimit,
  unpaidAmount,
  creditBalance,
  orderTotal
}) {
  if (!open) return null;

  return (
    <div className="credit-popup-overlay">
      <div className="credit-popup-card">
        <h2 className="credit-popup-title">
          Insufficient Credit Balance
        </h2>

        <div className="credit-popup-details">
          <div className="row">
            <span>Credit Limit</span>
            <span>₹{creditLimit}</span>
          </div>

          <div className="row">
            <span>Used Credit</span>
            <span>₹{unpaidAmount}</span>
          </div>

          <div className="row success">
            <span>Available Credit</span>
            <span>₹{creditBalance}</span>
          </div>

          <div className="row danger">
            <span>Order Total</span>
            <span>₹{orderTotal}</span>
          </div>
        </div>

        <div className="credit-popup-actions">
          <button onClick={onClose} className="btn-ok">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreditLimitPopup;

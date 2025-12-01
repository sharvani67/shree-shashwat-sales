// OrderSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./OrderPlace.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails } = location.state || {};

  if (!orderDetails) {
    return (
      <StaffMobileLayout>
        <div className="order-success-page">
          <div className="no-order-message">
            <h2>No Order Details Found</h2>
            <p>Please place an order first</p>
            <button onClick={() => navigate("/staff/place-sales-order")}>
              Go to Sales Order
            </button>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="order-success-page">
        <div className="success-header">
          <h1>🎉 Order Successful!</h1>
          <p className="success-message">
            Your order has been placed successfully and is being processed.
          </p>
        </div>

        <div className="order-receipt">
          <div className="receipt-header">
            <h2>Order Receipt</h2>
            <div className="receipt-status success">COMPLETED</div>
          </div>
          
          <div className="receipt-body">
            <div className="receipt-row">
              <span>Order Number:</span>
              <strong>{orderDetails.orderNumber}</strong>
            </div>
            <div className="receipt-row">
              <span>Order Date:</span>
              <span>{orderDetails.date}</span>
            </div>
            <div className="receipt-row">
              <span>Customer Name:</span>
              <span>{orderDetails.customerName}</span>
            </div>
            
            <div className="amount-section">
              <div className="receipt-row amount-row">
                <span>Total Amount:</span>
                <strong className="total-amount">
                  ₹{orderDetails.amount.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="payment-info">
              <h4>Payment Information</h4>
              <p>💰 <strong>Credit Payment</strong></p>
              <p className="payment-note">
                Amount has been added to customer's credit account.
              </p>
            </div>
          </div>

          <div className="receipt-footer">
            <p>Thank you for your business!</p>
            <p>Order will be delivered as per the scheduled date.</p>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate("/staff/place-sales-order")}
            className="new-order-btn"
          >
            Create New Order
          </button>
          <button 
            onClick={() => navigate("/staff/dashboard")}
            className="dashboard-btn"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => window.print()}
            className="print-btn"
          >
            Print Receipt
          </button>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default OrderSuccess;
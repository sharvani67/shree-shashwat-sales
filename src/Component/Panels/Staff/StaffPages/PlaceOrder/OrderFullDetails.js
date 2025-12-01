import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./OrderFullDetails.css";
import { baseurl } from "../../../../BaseURL/BaseURL";

function OrderFullDetails() {
  const { orderNumber } = useParams();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(
          `${baseurl}/orders/details/${orderNumber}`
        );
        setOrderData(res.data);
      } catch (error) {
        console.error("Error loading order details:", error);
      }
    };

    loadData();
  }, [orderNumber]);

  if (!orderData) return <p>Loading...</p>;

  const { order, items } = orderData;

  return (
    <StaffMobileLayout>
      <div className="orderfd-m-container">
        {/* HEADER */}
        <div className="orderfd-m-header">
          <h1>Order Details</h1>
          <p>Order No: {order.order_number}</p>
        </div>

        {/* ORDER SUMMARY */}
        <div className="orderfd-m-summary-card">
          <h3>Order Summary</h3>
          <p><strong>Customer:</strong> {order.customer_name}</p>
          <p><strong>Order Total:</strong> ₹ {order.order_total}</p>
          <p><strong>Net Payable:</strong> ₹ {order.net_payable}</p>
          <p><strong>Invoice Number:</strong> {order.invoice_number}</p>

          <p><strong>Invoice Date:</strong> {new Date(order.invoice_date).toLocaleDateString()}</p>
          <p><strong>Delivery Date:</strong> {new Date(order.estimated_delivery_date).toLocaleDateString()}</p>
          <p><strong>Credit Period:</strong> {order.credit_period} Days</p>
        </div>

        {/* ITEMS SECTION */}
        <h2 className="orderfd-m-title">Items ({items.length})</h2>

        <div className="orderfd-m-items-list">
          {items.map((item) => (
            <div className="orderfd-m-item-card" key={item.id}>
              <div className="orderfd-m-item-header">
                <h4>{item.item_name}</h4>
                {/* <span>ID: {item.id}</span> */}
              </div>

              <p><strong>MRP:</strong> ₹ {item.mrp}</p>
              <p><strong>Sale Price:</strong> ₹ {item.sale_price}</p>
              <p><strong>Final Price:</strong> ₹ {item.price}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Total Amount:</strong> ₹ {item.total_amount}</p>

              <p><strong>Credit Days:</strong> {item.credit_period}</p>
              <p><strong>Credit %:</strong> {item.credit_percentage}%</p>

              <p><strong>Tax %:</strong> {item.tax_percentage}%</p>
              <p><strong>Tax Amount:</strong> ₹ {item.tax_amount}</p>

              <p><strong>Discount:</strong> {item.discount_percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default OrderFullDetails;

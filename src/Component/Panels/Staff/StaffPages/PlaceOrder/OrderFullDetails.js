// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
// import "./OrderFullDetails.css";
// import { baseurl } from "../../../../BaseURL/BaseURL";

// function OrderFullDetails() {
//   const { orderNumber } = useParams();
//   const [orderData, setOrderData] = useState(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const res = await axios.get(
//           `${baseurl}/orders/details/${orderNumber}`
//         );
//         setOrderData(res.data);
//       } catch (error) {
//         console.error("Error loading order details:", error);
//       }
//     };

//     loadData();
//   }, [orderNumber]);

//   if (!orderData) return <p>Loading...</p>;

//   const { order, items } = orderData;

//   return (
//     <StaffMobileLayout>
//       <div className="orderfd-m-container">
//         {/* HEADER */}
//         <div className="orderfd-m-header">
//           <h1>Order Details</h1>
//           <p>Order No: {order.order_number}</p>
//         </div>

//         {/* ORDER SUMMARY */}
//         <div className="orderfd-m-summary-card">
//           <h3>Order Summary</h3>
//           <p><strong>Customer:</strong> {order.customer_name}</p>
//           <p><strong>Order Total:</strong> ₹ {order.order_total}</p>
//           <p><strong>Net Payable:</strong> ₹ {order.net_payable}</p>
//           <p><strong>Invoice Number:</strong> {order.invoice_number}</p>

//           <p><strong>Invoice Date:</strong> {new Date(order.invoice_date).toLocaleDateString()}</p>
//           <p><strong>Delivery Date:</strong> {new Date(order.estimated_delivery_date).toLocaleDateString()}</p>
//           <p><strong>Credit Period:</strong> {order.credit_period} Days</p>
//         </div>

//         {/* ITEMS SECTION */}
//         <h2 className="orderfd-m-title">Items ({items.length})</h2>

//         <div className="orderfd-m-items-list">
//           {items.map((item) => (
//             <div className="orderfd-m-item-card" key={item.id}>
//               <div className="orderfd-m-item-header">
//                 <h4>{item.item_name}</h4>
//                 {/* <span>ID: {item.id}</span> */}
//               </div>

//               <p><strong>MRP:</strong> ₹ {item.mrp}</p>
//               <p><strong>Sale Price:</strong> ₹ {item.sale_price}</p>
//               <p><strong>Final Price:</strong> ₹ {item.price}</p>
//               <p><strong>Quantity:</strong> {item.quantity}</p>
//               <p><strong>Total Amount:</strong> ₹ {item.total_amount}</p>

//               <p><strong>Credit Days:</strong> {item.credit_period}</p>
//               <p><strong>Credit %:</strong> {item.credit_percentage}%</p>

//               <p><strong>Tax %:</strong> {item.tax_percentage}%</p>
//               <p><strong>Tax Amount:</strong> ₹ {item.tax_amount}</p>

//               <p><strong>Discount:</strong> {item.discount_percentage}%</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </StaffMobileLayout>
//   );
// }

// export default OrderFullDetails;



import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./OrderFullDetails.css";
import { baseurl } from "../../../../BaseURL/BaseURL";
import { FiPackage, FiUser, FiCalendar, FiCreditCard, FiTag, FiDollarSign, FiPercent } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";

function OrderFullDetails() {
  const { orderNumber } = useParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await axios.get(
          `${baseurl}/orders/details/${orderNumber}`
        );
        setOrderData(res.data);
      } catch (error) {
        console.error("Error loading order details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderNumber]);

  if (loading) return (
    <StaffMobileLayout>
      <div className="orderfd-m-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    </StaffMobileLayout>
  );

  if (!orderData) return (
    <StaffMobileLayout>
      <div className="orderfd-m-error">
        <p>Unable to load order details. Please try again.</p>
      </div>
    </StaffMobileLayout>
  );

  const { order, items } = orderData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <StaffMobileLayout>
      <div className="orderfd-m-container">
        {/* HEADER */}
        <div className="orderfd-m-header">
          <div className="orderfd-m-header-top">
            <h1><FiPackage /> Order Details</h1>
            <div className="orderfd-m-order-number">
              <span className="orderfd-m-order-badge">#{order.order_number}</span>
            </div>
          </div>
          <p className="orderfd-m-subtitle">Complete order information and item breakdown</p>
        </div>

        {/* ORDER SUMMARY */}
        <div className="orderfd-m-summary-card">
          <div className="orderfd-m-section-header">
            <h2><FiUser /> Order Summary</h2>
          </div>
          
          <div className="orderfd-m-grid">
            <div className="orderfd-m-info-item">
              <span className="orderfd-m-info-label"><FiUser /> Customer</span>
              <span className="orderfd-m-info-value">{order.customer_name}</span>
            </div>
            
            <div className="orderfd-m-info-item highlight">
              <span className="orderfd-m-info-label"><FiDollarSign /> Order Total</span>
              <span className="orderfd-m-info-value">₹ {formatCurrency(order.order_total)}</span>
            </div>
            
            <div className="orderfd-m-info-item highlight">
              <span className="orderfd-m-info-label"><FiCreditCard /> Net Payable</span>
              <span className="orderfd-m-info-value">₹ {formatCurrency(order.net_payable)}</span>
            </div>
            
            <div className="orderfd-m-info-item">
              <span className="orderfd-m-info-label"><FiTag /> Invoice</span>
              <span className="orderfd-m-info-value">{order.invoice_number}</span>
            </div>
          </div>
          
          <div className="orderfd-m-dates-grid">
            <div className="orderfd-m-date-item">
              <span className="orderfd-m-date-label"><FiCalendar /> Invoice Date</span>
              <span className="orderfd-m-date-value">{new Date(order.invoice_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
            
            <div className="orderfd-m-date-item">
              <span className="orderfd-m-date-label"><TbTruckDelivery /> Delivery Date</span>
              <span className="orderfd-m-date-value">{new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
            
            <div className="orderfd-m-date-item">
              <span className="orderfd-m-date-label"><FiPercent /> Credit Period</span>
              <span className="orderfd-m-date-value">{order.credit_period} Days</span>
            </div>
          </div>
        </div>

        {/* ITEMS SECTION */}
        <div className="orderfd-m-items-section">
          <div className="orderfd-m-section-header">
            <h2>Order Items ({items.length})</h2>
            <span className="orderfd-m-items-count">{items.length} items</span>
          </div>

          <div className="orderfd-m-items-list">
            {items.map((item, index) => (
              <div className="orderfd-m-item-card" key={item.id}>
                <div className="orderfd-m-item-header">
                  <div className="orderfd-m-item-number">#{index + 1}</div>
                  <h3>{item.item_name}</h3>
                </div>
                
                <div className="orderfd-m-item-prices">
                  <div className="orderfd-m-price-row">
                    <span>MRP</span>
                    <span className="orderfd-m-price-amount">₹ {formatCurrency(item.mrp)}</span>
                  </div>
                  <div className="orderfd-m-price-row">
                    <span>Sale Price</span>
                    <span className="orderfd-m-price-amount">₹ {formatCurrency(item.sale_price)}</span>
                  </div>
                  <div className="orderfd-m-price-row highlight">
                    <span>Final Price</span>
                    <span className="orderfd-m-price-amount">₹ {formatCurrency(item.price)}</span>
                  </div>
                </div>
                
                <div className="orderfd-m-item-details-grid">
                  <div className="orderfd-m-detail-item">
                    <span className="orderfd-m-detail-label">Quantity</span>
                    <span className="orderfd-m-detail-value">{item.quantity}</span>
                  </div>
                  <div className="orderfd-m-detail-item">
                    <span className="orderfd-m-detail-label">Total Amount</span>
                    <span className="orderfd-m-detail-value">₹ {formatCurrency(item.total_amount)}</span>
                  </div>
                </div>
                
                <div className="orderfd-m-item-meta-grid">
                  <div className="orderfd-m-meta-item">
                    <span className="orderfd-m-meta-label">Credit Days</span>
                    <span className="orderfd-m-meta-value">{item.credit_period}</span>
                  </div>
                  <div className="orderfd-m-meta-item">
                    <span className="orderfd-m-meta-label">Credit %</span>
                    <span className="orderfd-m-meta-value">{item.credit_percentage}%</span>
                  </div>
                  <div className="orderfd-m-meta-item">
                    <span className="orderfd-m-meta-label">Tax %</span>
                    <span className="orderfd-m-meta-value">{item.tax_percentage}%</span>
                  </div>
                  <div className="orderfd-m-meta-item">
                    <span className="orderfd-m-meta-label">Tax Amount</span>
                    <span className="orderfd-m-meta-value">₹ {formatCurrency(item.tax_amount)}</span>
                  </div>
                  <div className="orderfd-m-meta-item">
                    <span className="orderfd-m-meta-label">Discount</span>
                    <span className="orderfd-m-meta-value">{item.discount_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* FOOTER SUMMARY */}
        <div className="orderfd-m-footer-summary">
          <div className="orderfd-m-footer-item">
            <span>Total Items</span>
            <span>{items.length}</span>
          </div>
          <div className="orderfd-m-footer-item total">
            <span>Order Total</span>
            <span>₹ {formatCurrency(order.order_total)}</span>
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default OrderFullDetails;
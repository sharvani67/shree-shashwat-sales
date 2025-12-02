import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./Staff_orders.css";
import { useNavigate } from "react-router-dom";
import { baseurl } from "../../../../BaseURL/BaseURL";

function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState({});
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const orderplacedbyID = user ? JSON.parse(user).id : null;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${baseurl}/orders/orders-placed-by/${orderplacedbyID}`
        );

        setOrders(res.data);

        // Fetch items for each order
        res.data.forEach(async (order) => {
          const detailRes = await axios.get(
            `${baseurl}/orders/details/${order.order_number}`
          );

          setItemsByOrder((prev) => ({
            ...prev,
            [order.order_number]: detailRes.data.items, // store items
          }));
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setLoading(prev => ({ ...prev, [orderNumber]: true }));

    try {
      const response = await axios.put(
        `${baseurl}/orders/cancel/${orderNumber}`
      );

      if (response.data.success) {
        // Update the order status in local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.order_number === orderNumber 
              ? { ...order, invoice_status: 2 } 
              : order
          )
        );
        
        alert("Order cancelled successfully!");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.error || "Failed to cancel order. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 0: return { text: "Pending", className: "pending" };
      case 1: return { text: "Invoiced", className: "invoiced" };
      case 2: return { text: "Cancelled", className: "cancelled" };
      default: return { text: "Unknown", className: "unknown" };
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <StaffMobileLayout>
      <div className="orders-m-container">
        {/* Header */}
        <div className="orders-m-header">
          <div className="orders-m-header-text">
            <h1>Orders</h1>
            <p>Track customer orders and items</p>
          </div>
        </div>

        {/* Search */}
        <div className="orders-m-search">
          <input
            type="text"
            className="orders-m-search-input"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Orders List */}
        <div className="orders-m-section">
          <h2 className="orders-m-section-title">
            Orders ({filteredOrders.length})
          </h2>
          <p className="orders-m-section-subtitle">
            Includes invoice details and order items
          </p>

          <div className="orders-m-list">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusBadge(order.invoice_status);
              const canCancel = order.invoice_status === 0;
              
              return (
                <div
                  className="orders-m-card"
                  key={order.id}
                  onClick={() => navigate(`/staff/order-details/${order.order_number}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Order Header */}
                  <div className="orders-m-card-header">
                    <div className="orders-m-header-top">
                      <h3>{order.order_number}</h3>
                      <span className={`orders-m-status ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="orders-m-info">
                    <p className="orders-m-amount">Amount: ₹ {order.order_total}</p>
                    <p className="orders-m-date">
                      Invoice Date: {order.invoice_date 
                        ? new Date(order.invoice_date).toLocaleDateString() 
                        : "Not generated"}
                    </p>
                    <p className="orders-m-date">
                      Delivery Date: {new Date(order.estimated_delivery_date).toLocaleDateString()}
                    </p>
                    <p className="orders-m-credit">
                      Customer: {order.customer_name} 
                    </p>
                  </div>

                  {/* Items LIST */}
                  <div className="orders-m-items-section">
                    <h4 className="orders-m-items-title">Items</h4>

                    {!itemsByOrder[order.order_number] ? (
                      <p className="orders-m-loading">Loading items...</p>
                    ) : (
                      itemsByOrder[order.order_number].map((item) => (
                        <div className="orders-m-item-card" key={item.id}>
                          <div className="orders-m-item-header">
                            <span className="orders-m-item-name">{item.item_name}</span>
                            <span className="orders-m-item-qty">Qty: {item.quantity}</span>
                          </div>

                          <p className="orders-m-item-price">
                            Price: ₹ {item.price} | Total: ₹ {item.total_amount}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cancel Button (only if invoice_status is 0) */}
                  {canCancel && (
                    <div className="orders-m-footer" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="orders-m-cancel-btn"
                        onClick={() => handleCancelOrder(order.order_number)}
                        disabled={loading[order.order_number]}
                      >
                        {loading[order.order_number] ? "Cancelling..." : "Cancel Order"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffOrders;
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
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  console.log("User from localStorage:", user);
  const orderplacedbyID = user ? JSON.parse(user).id : null;
  console.log("Order Placed By ID:", orderplacedbyID);

// const orderplacedbyID = localStorage.getItem("");
 

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
          {/* <p className="orders-m-section-subtitle">
            Includes invoice details and order items
          </p> */}

          <div className="orders-m-list">
            {filteredOrders.map((order) => (
              <div
  className="orders-m-card"
  key={order.id}
  onClick={() => navigate(`/staff/order-details/${order.order_number}`)}
  style={{ cursor: "pointer" }}
>
                {/* Order Header */}
                <div className="orders-m-card-header">
                  <h3>{order.order_number}</h3>
                  {/* <span className="orders-m-id">ID: {order.id}</span> */}
                </div>

                {/* Order Info */}
                <div className="orders-m-info">
                  <p className="orders-m-amount">Amount: ₹ {order.order_total}</p>
                  <p className="orders-m-date">
                    Order Date: {new Date(order.created_at).toLocaleDateString()}
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

                {/* Footer */}
                {/* <div className="orders-m-footer">
                  <span className="orders-m-status delivered">Delivered</span>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffOrders;

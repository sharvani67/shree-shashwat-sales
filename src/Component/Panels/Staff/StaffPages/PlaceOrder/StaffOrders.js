import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./Staff_orders.css";
import { useNavigate } from "react-router-dom";
import { baseurl } from "../../../../BaseURL/BaseURL";
import { toast } from "react-toastify";
import { Download } from "lucide-react";

function StaffOrders() {
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCancel, setLoadingCancel] = useState({});
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
            [order.order_number]: detailRes.data.items,
          }));
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderNumber, e) => {
    e.stopPropagation(); // Prevent card click event

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setLoadingCancel(prev => ({ ...prev, [orderNumber]: true }));

    try {
      const response = await axios.put(
        `${baseurl}/orders/cancel/${orderNumber}`
      );

      if (response.data.success) {
        // Update the order in local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.order_number === orderNumber
              ? { ...order, order_status: 'Cancelled' }
              : order
          )
        );

        toast.success("Order cancelled successfully!");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error.response?.data?.error || "Failed to cancel order");
    } finally {
      setLoadingCancel(prev => ({ ...prev, [orderNumber]: false }));
    }
  };

  // Helper function to determine display status
  const getDisplayStatus = (order) => {
    // If cancelled, show cancelled
    if (order.order_status === 'Cancelled') {
      return 'Cancelled';
    }

    // If invoice is generated (invoice_status = 1), show Invoice
    if (order.invoice_status === 1) {
      return 'Invoiced';
    }

    // Default to Pending
    return 'Pending';
  };

  // Helper function to determine if cancel button should be shown
  const shouldShowCancelButton = (order) => {
    // Hide cancel if already cancelled
    if (order.order_status === "Cancelled") return false;

    // Hide cancel if rejected
    if (order.approval_status === "Rejected") return false;

    // Only show if invoice_status is 0 AND order_status is not Invoice
    if (order.invoice_status === 0 && order.order_status !== "Invoice") {
      return true;
    }

    return false;
  };

  // Handle download invoice click
  const handleDownloadInvoice = (orderNumber, e) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/staff/invoices?orderNumber=${orderNumber}`);
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
              const displayStatus = getDisplayStatus(order);
              const showCancelButton = shouldShowCancelButton(order);
              const isInvoiced = displayStatus === 'Invoiced';

              return (
                <div
                  className="orders-m-card"
                  key={order.id}
                  onClick={() => navigate(`/staff/order-details/${order.order_number}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Order Header - Now with order number and status on same line */}
                  <div className="orders-m-card-header">
                    <div className="orders-m-header-row">
                      <h3 className="orders-m-order-number">{order.order_number}</h3>
                      <span
                        className={`orders-m-status-badge ${displayStatus === 'Cancelled' ? 'cancelled' :
                            displayStatus === 'Invoiced' ? 'invoice' : 'pending'
                          }`}
                      >
                        {displayStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="orders-m-info">
                    <p className="orders-m-amount">Amount: ₹ {order.order_total}</p>
                    <p className="orders-m-credit">
                      Customer: {order.customer_name}
                    </p>
                    <div className="approval-row">
                      <span className="approval-label">Approval Status : </span>
                      <span
                        className={`approval-badge ${
                          order.approval_status === "Approved"
                            ? "approval-approved"
                            : order.approval_status === "Rejected"
                            ? "approval-rejected"
                            : "approval-pending"
                        }`}
                      >
                        {order.approval_status === "Pending"
                          ? "Pending"
                          : order.approval_status}
                      </span>
                    </div>
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

                  {/* Footer - Now includes cancel button and invoice download button */}
                  <div className="orders-m-footer">
                    <div className="orders-m-footer-left">
                      {displayStatus === 'Cancelled' && (
                        <span className="orders-m-cancelled-label">
                          ❌ Order Cancelled
                        </span>
                      )}
                      {isInvoiced && (
                        <button
                          className="orders-m-invoice-btn"
                          onClick={(e) => handleDownloadInvoice(order.order_number, e)}
                        >
                          <Download size={16} />
                          <span>Download Invoice</span>
                        </button>
                      )}
                    </div>

                    {/* Cancel Button */}
                    {showCancelButton && (
                      <button
                        className="orders-m-cancel-btn"
                        onClick={(e) => handleCancelOrder(order.order_number, e)}
                        disabled={loadingCancel[order.order_number]}
                      >
                        {loadingCancel[order.order_number] ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Order'
                        )}
                      </button>
                    )}
                  </div>
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
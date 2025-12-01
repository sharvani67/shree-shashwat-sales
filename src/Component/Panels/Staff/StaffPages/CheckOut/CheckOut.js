// Checkout.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./CheckOut.css";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    retailerId, 
    customerName, 
    discount, 
    cartItems, 
    staffId, 
    userRole,
    totals 
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Get logged-in staff info from localStorage
  React.useEffect(() => {
    const getStaffInfo = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        try {
          const user = JSON.parse(storedData);
          console.log("Logged in user:", user);
          // You can use this to verify staff ID
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    };
    getStaffInfo();
  }, []);

  // Calculate totals if not passed
  const calculateTotals = () => {
    if (totals) return totals;
    
    let subtotal = 0;
    let creditCharges = 0;

    (cartItems || []).forEach(item => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      
      if (item.credit_percentage && item.credit_percentage > 0) {
        creditCharges += itemTotal * (item.credit_percentage / 100);
      }
    });

    const discountAmount = discount ? (subtotal * (discount / 100)) : 0;
    const finalTotal = subtotal + creditCharges - discountAmount;

    return {
      subtotal,
      creditCharges,
      discountAmount,
      finalTotal,
      itemCount: (cartItems || []).reduce((sum, item) => sum + (item.quantity || 1), 0)
    };
  };

  const finalTotals = calculateTotals();

  const handlePlaceOrder = async () => {
    if (!retailerId || !cartItems || cartItems.length === 0) {
      alert("Missing required information");
      return;
    }

    // Get staff ID from localStorage if not passed in state
    const loggedInUser = localStorage.getItem("user");
    let actualStaffId = staffId;
    
    if (!actualStaffId && loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        actualStaffId = user.id; // Assuming staff ID is in user.id
        console.log("Using staff ID from localStorage:", actualStaffId);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    if (!actualStaffId) {
      alert("Staff ID is required. Please log in again.");
      return;
    }

    setLoading(true);

    // Prepare order data
    const orderData = {
    customer_id: retailerId,
    customer_name: customerName || "Walk-in Customer",
    order_total: finalTotals.subtotal,
    discount_amount: finalTotals.discountAmount,
    taxable_amount: finalTotals.subtotal,
    tax_amount: 0,
    net_payable: finalTotals.finalTotal,
    credit_period: cartItems[0]?.credit_period || "0",
    estimated_delivery_date: new Date().toISOString().split('T')[0],
    order_placed_by: actualStaffId, // Staff ID
    staff_id: actualStaffId, // Also send as staff_id
    order_mode: "KACHA",
    clear_cart: true, // Optional: tell backend to clear cart
    items: cartItems.map(item => ({
      item_name: item.item_name || `Product ${item.product_id}`,
      product_id: item.product_id,
      price: item.price || 0,
      quantity: item.quantity || 1,
      total_amount: (item.price || 0) * (item.quantity || 1),
      discount_percentage: item.discount_percentage || 0,
      discount_amount: item.discount_amount || 0,
      taxable_amount: (item.price || 0) * (item.quantity || 1),
      tax_percentage: item.tax_percentage || 0,
      tax_amount: item.tax_amount || 0,
      item_total: (item.price || 0) * (item.quantity || 1),
      credit_period: item.credit_period || "0",
      credit_percentage: item.credit_percentage || 0,
      // Add these if your items have them
      mrp: item.mrp || item.price,
      sale_price: item.sale_price || item.price
    }))
  };

  console.log("Sending order data:", orderData);

    try {
      const response = await fetch(`${baseurl}/orders/create-complete-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log("Order response:", result);

      if (response.ok && result.success) {
        setOrderDetails({
          orderNumber: result.order_number,
          orderId: result.order_id,
          amount: result.net_payable,
          customerName: customerName,
          staffId: result.staff_id,
          date: new Date().toLocaleDateString()
        });
        setOrderPlaced(true);
      } else {
        throw new Error(result.error || result.details || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate("/staff/cart", {
      state: {
        retailerId,
        customerName,
        discount,
        cartItems,
        staffId,
        userRole,
        totals: finalTotals
      }
    });
  };

  const handleViewOrder = () => {
    if (orderDetails) {
      navigate(`/staff/order-success`, { 
        state: { orderDetails } 
      });
    }
  };

  const handleNewOrder = () => {
    navigate("/staff/place-sales-order");
  };

  if (orderPlaced && orderDetails) {
    return (
      <StaffMobileLayout>
        <div className="checkout-page">
          <div className="order-success-container">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            
            <div className="order-details-card">
              <h3>Order Details</h3>
              <div className="order-detail-row">
                <span>Order Number:</span>
                <strong>{orderDetails.orderNumber}</strong>
              </div>
              <div className="order-detail-row">
                <span>Customer:</span>
                <span>{orderDetails.customerName}</span>
              </div>
              <div className="order-detail-row">
                <span>Placed by Staff ID:</span>
                <strong>{orderDetails.staffId}</strong>
              </div>
              <div className="order-detail-row">
                <span>Date:</span>
                <span>{orderDetails.date}</span>
              </div>
              <div className="order-detail-row">
                <span>Total Amount:</span>
                <strong className="total-amount">
                  ₹{orderDetails.amount.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="order-actions">
              <button 
                onClick={handleViewOrder}
                className="view-order-btn"
              >
                View Order Details
              </button>
              <button 
                onClick={handleNewOrder}
                className="new-order-btn"
              >
                Create New Order
              </button>
            </div>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="checkout-page">
        {/* Header */}
        <div className="checkout-header">
          <button 
            className="back-btn"
            onClick={handleBackToCart}
          >
            ← Back to Cart
          </button>
          <h1>Checkout</h1>
          <div className="customer-info">
            Customer: <strong>{customerName || "N/A"}</strong>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          
          <div className="summary-item">
            <span>Subtotal:</span>
            <span>₹{finalTotals.subtotal.toLocaleString()}</span>
          </div>
          
          {finalTotals.creditCharges > 0 && (
            <div className="summary-item credit">
              <span>Credit Charges:</span>
              <span>+₹{finalTotals.creditCharges.toLocaleString()}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="summary-item discount">
              <span>Discount ({discount}%):</span>
              <span>-₹{finalTotals.discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="summary-item total">
            <span>Total Amount:</span>
            <strong>₹{finalTotals.finalTotal.toLocaleString()}</strong>
          </div>
        </div>

        {/* Items List */}
        <div className="checkout-items">
          <h3>Items ({cartItems?.length || 0})</h3>
          <div className="items-list">
            {cartItems?.map((item, index) => (
              <div key={index} className="checkout-item">
                <div className="item-info">
                  <h4>{item.item_name || `Product ${item.product_id}`}</h4>
                  <p>Qty: {item.quantity} × ₹{item.price}</p>
                  {item.credit_period > 0 && (
                    <p className="credit-info">
                      Credit: {item.credit_period} days ({item.credit_percentage}%)
                    </p>
                  )}
                </div>
                <div className="item-amount">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Info */}
        <div className="staff-info-section">
          <h3>Order Placed By</h3>
          <p>Staff ID: <strong>{staffId || "Loading..."}</strong></p>
          <p>Role: <strong>{userRole || "Staff"}</strong></p>
        </div>

        {/* Place Order Button */}
        <div className="place-order-section">
          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !cartItems || cartItems.length === 0}
            className={`place-order-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? "Processing..." : `Place Order - ₹${finalTotals.finalTotal.toLocaleString()}`}
          </button>
          <p className="payment-note">
            Note: Order will be placed under staff ID: {staffId || "Current User"}
          </p>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default Checkout;
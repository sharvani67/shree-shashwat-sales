import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./CheckOut.css";
// import CreditLimitPopup from "./CreditLimitPopup";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [retailerDetails, setRetailerDetails] = useState(null);
  const [showCreditPopup, setShowCreditPopup] = useState(false);

  const {
    retailerId,
    customerName,
    retailermail,
    discount,
    cartItems: initialCartItems,
    staffId: initialStaffId,
    userRole,
    totals: initialTotals,
    orderTotals: initialOrderTotals,
    userDiscountPercentage
  } = location.state || {};

  const discountPercentage = discount || userDiscountPercentage || 0;

  useEffect(() => {
    const fetchRetailerDetails = async () => {
      if (!retailerId) return;

      try {
        const res = await fetch(`${baseurl}/accounts/${retailerId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Retailer Details:", data);
          setRetailerDetails(data);
        } else {
          console.warn("Failed to fetch retailer details");
        }
      } catch (err) {
        console.error("Error fetching retailer:", err);
      }
    };

    fetchRetailerDetails();
  }, [retailerId]);

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderMode, setOrderMode] = useState('KACHA'); // Default to KACHA
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [orderTotals, setOrderTotals] = useState(initialOrderTotals || {});

  // Get logged-in staff info from localStorage
  useEffect(() => {
    const getStaffInfo = () => {
      const storedData = localStorage.getItem("user");
      if (storedData) {
        try {
          const user = JSON.parse(storedData);
          console.log("Logged in user:", user);
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }
    };
    getStaffInfo();
  }, []);

  // Enhanced place order function with all calculations
// Enhanced place order function with all calculations
const handlePlaceOrder = async () => {
  if (!retailerId || !cartItems || cartItems.length === 0) {
    alert("Missing required information");
    return;
  }
  
  // Get staff info from localStorage
  const storedData = localStorage.getItem("user");
  let loggedInUser = null;
  let actualStaffId = initialStaffId;
  let staffName = null;
  let assignedStaff = null;
  let staffIdFromStorage = null;

  if (storedData) {
    try {
      loggedInUser = JSON.parse(storedData);
      console.log("Logged in user data:", loggedInUser);

      // Extract user information
      staffName = loggedInUser.name || "Staff Member";
      staffIdFromStorage = loggedInUser.id;
      assignedStaff = loggedInUser.assigned_staff || loggedInUser.supervisor_name || staffName;

      // Use staff ID from localStorage if not provided in state
      if (!actualStaffId && staffIdFromStorage) {
        actualStaffId = staffIdFromStorage;
        console.log("Using staff ID from localStorage:", actualStaffId);
      }

      console.log("Staff Name:", staffName);
      console.log("Assigned Staff:", assignedStaff);

    } catch (err) {
      console.error("Error parsing user data:", err);
    }
  }

  if (!actualStaffId) {
    alert("Staff ID is required. Please log in again.");
    return;
  }

  setLoading(true);

  // ---------------------------------------------------------
  // 1. Fetch Staff Details From Backend (accounts/:id)
  // ---------------------------------------------------------
  let staffIncentive = 0;
  let assignedStaffName = "Unknown Staff";
  let staffEmail = null;

  try {
    const staffRes = await fetch(`${baseurl}/accounts/${actualStaffId}`);
    if (staffRes.ok) {
      const staffData = await staffRes.json();
      console.log("Fetched Staff Data:", staffData);

      staffIncentive = staffData.incentive_percent || 0;
      assignedStaffName = staffData.name || "Unknown Staff";
      staffEmail = staffData.email || null;
      staffMobile = staffData.mobile_number || null;
    } else {
      console.warn("Failed to fetch staff details from backend");
    }
  } catch (error) {
    console.error("Error fetching staff details:", error);
  }

  // Generate order number
  const orderNumber = `ORD${Date.now()}`;

  // Calculate total credit charges from all items
  const totalCreditCharges = cartItems.reduce((sum, item) => {
    const breakdown = item.breakdown?.perUnit || {};
    return sum + ((breakdown.credit_charge || 0) * (item.quantity || 1));
  }, 0);

  // Prepare order data using the breakdown from cart
  const orderData = {
    order: {
      order_number: orderNumber,
      customer_id: retailerId,
      customer_name: customerName || retailerDetails?.name || "Customer",
      order_total: orderTotals.totalCustomerSalePrice,
      discount_amount: orderTotals.totalDiscount,
      taxable_amount: orderTotals.totalTaxableAmount,
      tax_amount: orderTotals.totalTax,
      net_payable: orderTotals.finalTotal,
      credit_period: totalCreditCharges, // This should be the total credit charges amount
      estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      order_placed_by: actualStaffId,
      order_mode: orderMode,
      approval_status: "Pending",
      ordered_by: staffName,
      order_status: "Pending",
      staffid: actualStaffId,
      assigned_staff: assignedStaffName,
      staff_incentive: staffIncentive.toString(), // Convert to string
      staff_email: staffEmail,
      staff_mobile: staffMobile,
      retailer_email: retailerDetails?.email || retailermail,
      retailer_mobile: retailerDetails?.mobile_number ,
    },
    orderItems: cartItems.map(item => {
      const breakdown = item.breakdown?.perUnit || {};
      const product = item.product_details || {};
      const quantity = item.quantity || 1;
      const creditCharge = breakdown.credit_charge || 0;
      const finalAmount = breakdown.final_amount || 0;

      return {
        order_number: orderNumber,
        item_name: item.item_name || product.name || `Product ${item.product_id}`,
        product_id: item.product_id,
        quantity: quantity,
        
        // Use the pre-calculated breakdown values from cart
        mrp: breakdown.mrp || 0,
        sale_price: breakdown.sale_price || 0,
        edited_sale_price: breakdown.edited_sale_price || 0,
        credit_charge: creditCharge,
        credit_period: item.credit_period || 0,
        credit_percentage: (breakdown.credit_percentage || 0).toString(),
        customer_sale_price: breakdown.customer_sale_price || 0,
        discount_percentage: (breakdown.discount_percentage || 0).toString(),
        discount_amount: breakdown.discount_amount || 0,
        item_total: breakdown.item_total || 0,
        taxable_amount: breakdown.taxable_amount || 0,
        tax_percentage: (breakdown.tax_percentage || 0).toString(),
        tax_amount: breakdown.tax_amount || 0,
        sgst_percentage: (breakdown.sgst_percentage || 0).toString(),
        sgst_amount: breakdown.sgst_amount || 0,
        cgst_percentage: (breakdown.cgst_percentage || 0).toString(),
        cgst_amount: breakdown.cgst_amount || 0,
        final_amount: finalAmount,
        total_amount: finalAmount * quantity,
        discount_applied_scheme: breakdown.discount_percentage > 0 ? 'user_discount' : 'none'
      };
    })
  };

  console.log("Sending order data:", JSON.stringify(orderData, null, 2));

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
        orderNumber: result.order_number || orderData.order.order_number,
        orderId: result.order_id,
        amount: orderData.order.net_payable,
        customerName: customerName || retailerDetails?.name || "Customer",
        staffId: actualStaffId,
        staffName: staffName,
        date: new Date().toLocaleDateString(),
        orderMode: orderMode,
        breakdown: orderTotals
      });
      setOrderPlaced(true);
    } else {
      throw new Error(result.error || result.details || result.message || "Failed to place order");
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
        discount: discountPercentage,
        cartItems,
        staffId: initialStaffId,
        userRole,
        orderTotals,
        userDiscountPercentage: discountPercentage
      }
    });
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
                <span>Order Mode:</span>
                <strong className={`order-mode-badge ${orderDetails.orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
                  {orderDetails.orderMode}
                </strong>
              </div>
              <div className="order-detail-row">
                <span>Customer:</span>
                <span>{orderDetails.customerName}</span>
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
            <div className="action-buttons">
              <button onClick={() => navigate("/staff/dashboard")} className="home-btn">
                Go to Dashboard
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

        {/* Order Mode Selection */}
        <div className="order-mode-section">
          <h3>Order Mode</h3>
          <div className="order-mode-buttons">
            <button
              className={`order-mode-btn ${orderMode === 'KACHA' ? 'active' : ''}`}
              onClick={() => setOrderMode('KACHA')}
            >
              KACHA
            </button>
            <button
              className={`order-mode-btn ${orderMode === 'PAKKA' ? 'active' : ''}`}
              onClick={() => setOrderMode('PAKKA')}
            >
              PAKKA
            </button>
          </div>
         
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary ({orderTotals.itemCount || cartItems.length} items)</h2>
          {orderTotals.totalCreditCharges > 0 && (
            <div className="summary-row credit">
              <span>Credit Charges:</span>
              <span>+₹{orderTotals.totalCreditCharges?.toLocaleString() || '0'}</span>
            </div>
          )}

          {orderTotals.totalDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount ({orderTotals.userDiscount || discountPercentage}%):</span>
              <span>-₹{orderTotals.totalDiscount?.toLocaleString() || '0'}</span>
            </div>
          )}


          {orderTotals.totalTax > 0 && (
            <>
              <div className="summary-row">
                <span>Taxable Amount:</span>
                <span>₹{orderTotals.totalTaxableAmount?.toLocaleString() || '0'}</span>
              </div>
              
              <div className="summary-row tax">
                <span>Total GST:</span>
                <span>+₹{orderTotals.totalTax?.toLocaleString() || '0'}</span>
              </div>
            </>
          )}

          <div className="summary-row total">
            <span>Final Total:</span>
            <strong>₹{orderTotals.finalTotal?.toLocaleString() || '0'}</strong>
          </div>

          {/* Order Mode Display */}
          <div className="summary-row mode-display">
            <span>Order Mode:</span>
            <span className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
              {orderMode} {orderMode === 'PAKKA' ? '✓' : '⏳'}
            </span>
          </div>


          {orderTotals.totalDiscount > 0 && (
            <div className="savings-note">
              🎉 Customer saved ₹{orderTotals.totalDiscount?.toLocaleString() || '0'} with {orderTotals.userDiscount || discountPercentage}% discount!
            </div>
          )}
        </div>


        {/* Place Order Button */}
        <div className="place-order-section">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !cartItems || cartItems.length === 0 }
            className={`place-order-btn ${loading ? 'loading' : ''} `}
          >
            {loading ? "Processing..." : `Place ${orderMode} Order - ₹${orderTotals.finalTotal?.toLocaleString() || '0'}`}
          </button>
          
         
        </div>

      </div>
    </StaffMobileLayout>
  );
}

export default Checkout;
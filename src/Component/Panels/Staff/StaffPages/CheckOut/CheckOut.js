// Checkout.jsx
import React, { useState, useEffect } from "react";
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
    cartItems: initialCartItems, 
    staffId: initialStaffId, 
    userRole,
    totals: initialTotals,
    creditBreakdown: initialCreditBreakdown
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderMode, setOrderMode] = useState('KACHA'); // Default to KACHA
  const [cartItems, setCartItems] = useState(initialCartItems || []);
  const [totals, setTotals] = useState(initialTotals || {});
  const [creditBreakdown, setCreditBreakdown] = useState(initialCreditBreakdown || {});

  // Get logged-in staff info from localStorage
  useEffect(() => {
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

  // Recalculate totals if cart items changed
  useEffect(() => {
    if (cartItems.length > 0) {
      const recalculatedTotals = calculateTotals();
      setTotals(recalculatedTotals);
      
      const recalculatedCreditBreakdown = calculateCreditBreakdown();
      setCreditBreakdown(recalculatedCreditBreakdown);
    }
  }, [cartItems, discount]);

  // Calculate item breakdown (same as CartPage)
  const calculateItemBreakdown = (item) => {
    const product = item.productDetails || {};
    const price = parseFloat(product.price) || parseFloat(item.price) || 0;
    const gstRate = parseFloat(product.gst_rate) || parseFloat(item.gst_rate) || 0;
    const isInclusiveGST = product.inclusive_gst === "Inclusive" || item.inclusive_gst === "Inclusive";
    const quantity = parseInt(item.quantity) || 1;
    const creditMultiplier = item.credit_percentage ? (1 + (parseFloat(item.credit_percentage) / 100)) : 1;
    const creditPercentage = parseFloat(item.credit_percentage) || 0;
    const userDiscountPercentage = parseFloat(discount) || 0;

    // FOR INCLUSIVE GST
    if (isInclusiveGST) {
      // Step 1: Extract base amount from price (which includes GST)
      const baseAmountPerUnit = price / (1 + (gstRate / 100));
      
      // Step 2: Apply credit charge per unit
      const priceAfterCreditPerUnit = baseAmountPerUnit * creditMultiplier;
      const creditChargePerUnit = priceAfterCreditPerUnit - baseAmountPerUnit;
      
      // Step 3: Calculate total for quantity
      const totalBaseAmount = baseAmountPerUnit * quantity;
      const totalCreditCharges = creditChargePerUnit * quantity;
      const totalAmountAfterCredit = totalBaseAmount + totalCreditCharges;
      
      // Step 4: Apply user discount
      let discountAmount = 0;
      if (userDiscountPercentage > 0) {
        discountAmount = (totalAmountAfterCredit * userDiscountPercentage) / 100;
      }
      
      // Step 5: Calculate taxable amount
      const taxableAmount = totalAmountAfterCredit - discountAmount;
      
      // Step 6: Calculate tax amount on taxable amount
      const taxAmount = (taxableAmount * gstRate) / 100;
      
      // Step 7: Final total
      const finalPayableAmount = taxableAmount + taxAmount;

      return {
        basePrice: price,
        gstRate,
        isInclusiveGST: true,
        quantity,
        creditMultiplier,
        creditPercentage,
        userDiscountPercentage,
        
        totalBaseAmount,
        totalCreditCharges,
        discountAmount,
        taxableAmount,
        taxAmount,
        finalPayableAmount
      };
    }
    
    // FOR EXCLUSIVE GST
    else {
      const baseAmountPerUnit = price;
      const priceAfterCreditPerUnit = baseAmountPerUnit * creditMultiplier;
      const creditChargePerUnit = priceAfterCreditPerUnit - baseAmountPerUnit;
      
      const totalBaseAmount = baseAmountPerUnit * quantity;
      const totalCreditCharges = creditChargePerUnit * quantity;
      const totalAmountAfterCredit = totalBaseAmount + totalCreditCharges;
      
      let discountAmount = 0;
      if (userDiscountPercentage > 0) {
        discountAmount = (totalAmountAfterCredit * userDiscountPercentage) / 100;
      }
      
      const taxableAmount = totalAmountAfterCredit - discountAmount;
      const taxAmount = (taxableAmount * gstRate) / 100;
      const finalPayableAmount = taxableAmount + taxAmount;

      return {
        basePrice: price,
        gstRate,
        isInclusiveGST: false,
        quantity,
        creditMultiplier,
        creditPercentage,
        userDiscountPercentage,
        
        totalBaseAmount,
        totalCreditCharges,
        discountAmount,
        taxableAmount,
        taxAmount,
        finalPayableAmount
      };
    }
  };

  // Calculate credit breakdown for the entire cart
  const calculateCreditBreakdown = () => {
    let subtotal = 0;
    let totalCreditCharges = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let finalTotal = 0;

    cartItems.forEach(item => {
      const breakdown = calculateItemBreakdown(item);
      subtotal += breakdown.totalBaseAmount;
      totalCreditCharges += breakdown.totalCreditCharges;
      totalDiscount += breakdown.discountAmount;
      totalTax += breakdown.taxAmount;
      finalTotal += breakdown.finalPayableAmount;
    });

    return {
      subtotal,
      totalCreditCharges,
      totalDiscount,
      totalTax,
      userDiscount: parseFloat(discount) || 0,
      finalTotal
    };
  };

  // Calculate totals if not passed
  const calculateTotals = () => {
    if (initialTotals) return initialTotals;
    
    const breakdown = calculateCreditBreakdown();
    
    return {
      subtotal: breakdown.subtotal,
      creditCharges: breakdown.totalCreditCharges,
      discountAmount: breakdown.totalDiscount,
      finalTotal: breakdown.finalTotal,
      itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0)
    };
  };

  // Calculate average credit period
  const calculateAverageCreditPeriod = () => {
    const totalPeriod = cartItems.reduce((sum, item) => 
      sum + (parseInt(item.credit_period) || 0), 0);
    return cartItems.length > 0 ? Math.round(totalPeriod / cartItems.length) : 0;
  };

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
      staffName = loggedInUser.name || loggedInUser.username || loggedInUser.full_name || "Staff Member";
      staffIdFromStorage = loggedInUser.id || loggedInUser.user_id || loggedInUser.staff_id;
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

  // If staff name is still null, provide a default
  if (!staffName) {
    staffName = `Staff ${actualStaffId}`;
  }
  
  if (!assignedStaff) {
    assignedStaff = staffName;
  }

  setLoading(true);

  // Generate order number
  const orderNumber = `ORD${Date.now()}`;
  const averageCreditPeriod = calculateAverageCreditPeriod();
  const breakdown = calculateCreditBreakdown();

  // Prepare order data in the format backend expects
  const orderData = {
    order: {
      order_number: orderNumber,
      customer_id: retailerId,
      customer_name: customerName || "Walk-in Customer",
      order_total: breakdown.subtotal + breakdown.totalCreditCharges,
      discount_amount: breakdown.totalDiscount,
      taxable_amount: breakdown.subtotal + breakdown.totalCreditCharges - breakdown.totalDiscount,
      tax_amount: breakdown.totalTax,
      net_payable: breakdown.finalTotal,
      credit_period: averageCreditPeriod,
      estimated_delivery_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      order_placed_by: actualStaffId,
      order_mode: orderMode,
      // Fixed: Use staffName instead of loggedInUser?.name
      ordered_by: staffName,
      // Use actualStaffId for staff_id field
      // staff_id: actualStaffId,
      // assigned_staff: assignedStaff,
      invoice_number: null,
      invoice_date: null,
      invoice_status: 0,
      order_status: "Pending"
    },
    orderItems: cartItems.map(item => {
      const itemBreakdown = calculateItemBreakdown(item);
      const product = item.productDetails || {};
      const gstRate = parseFloat(product.gst_rate) || 0;
      
      // Split GST 50/50 for SGST and CGST
      const sgstPercentage = gstRate / 2;
      const cgstPercentage = gstRate / 2;
      const sgstAmount = itemBreakdown.taxAmount / 2;
      const cgstAmount = itemBreakdown.taxAmount / 2;
      
      const mrp = parseFloat(item.mrp) || itemBreakdown.basePrice;
      const salePrice = parseFloat(item.sale_price) || itemBreakdown.basePrice;
      const priceAfterCredit = itemBreakdown.basePrice * itemBreakdown.creditMultiplier;

      return {
        order_number: orderNumber,
        item_name: item.item_name || product.name || `Product ${item.product_id}`,
        product_id: item.product_id,
        mrp: mrp,
        sale_price: salePrice,
        price: priceAfterCredit,
        quantity: item.quantity || 1,
        total_amount: itemBreakdown.totalBaseAmount + itemBreakdown.totalCreditCharges,
        discount_percentage: discount,
        discount_amount: itemBreakdown.discountAmount,
        taxable_amount: itemBreakdown.taxableAmount,
        tax_percentage: gstRate,
        tax_amount: itemBreakdown.taxAmount,
        item_total: itemBreakdown.finalPayableAmount,
        credit_period: item.credit_period || 0,
        credit_percentage: item.credit_percentage || 0,
        sgst_percentage: sgstPercentage,
        sgst_amount: sgstAmount,
        cgst_percentage: cgstPercentage,
        cgst_amount: cgstAmount,
        discount_applied_scheme: discount > 0 ? 'user_discount' : null
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
        amount: breakdown.finalTotal,
        customerName: customerName || "Walk-in Customer",
        staffId: actualStaffId,
        staffName: staffName,
        date: new Date().toLocaleDateString(),
        orderMode: orderMode,
        breakdown: breakdown
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
        discount,
        cartItems,
        staffId: initialStaffId,
        userRole,
        totals,
        creditBreakdown
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

            {/* Order Summary Breakdown */}
            <div className="breakdown-card">
              <h4>Payment Breakdown</h4>
              <div className="breakdown-row">
                <span>Subtotal:</span>
                <span>₹{orderDetails.breakdown.subtotal.toLocaleString()}</span>
              </div>
              {orderDetails.breakdown.totalCreditCharges > 0 && (
                <div className="breakdown-row credit">
                  <span>Credit Charges:</span>
                  <span>+₹{orderDetails.breakdown.totalCreditCharges.toLocaleString()}</span>
                </div>
              )}
              {orderDetails.breakdown.totalDiscount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount ({orderDetails.breakdown.userDiscount}%):</span>
                  <span>-₹{orderDetails.breakdown.totalDiscount.toLocaleString()}</span>
                </div>
              )}
              {orderDetails.breakdown.totalTax > 0 && (
                <div className="breakdown-row tax">
                  <span>GST:</span>
                  <span>+₹{orderDetails.breakdown.totalTax.toLocaleString()}</span>
                </div>
              )}
              <div className="breakdown-row total">
                <span>Final Total:</span>
                <strong>₹{orderDetails.breakdown.finalTotal.toLocaleString()}</strong>
              </div>
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
          <p className="order-mode-note">
            {orderMode === 'KACHA' 
              ? 'KACHA: Temporary order, invoice will be generated later'
              : 'PAKKA: Complete order with immediate invoice'}
          </p>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          
          <div className="summary-item">
            <span>Subtotal ({cartItems.length} items):</span>
            <span>₹{creditBreakdown.subtotal?.toLocaleString() || '0'}</span>
          </div>
          
          {creditBreakdown.totalCreditCharges > 0 && (
            <div className="summary-item credit">
              <span>Credit Charges:</span>
              <span>+₹{creditBreakdown.totalCreditCharges?.toLocaleString() || '0'}</span>
            </div>
          )}
          
          {discount > 0 && (
            <div className="summary-item discount">
              <span>Discount ({discount}%):</span>
              <span>-₹{creditBreakdown.totalDiscount?.toLocaleString() || '0'}</span>
            </div>
          )}
          
          {creditBreakdown.totalTax > 0 && (
            <div className="summary-item tax">
              <span>GST:</span>
              <span>+₹{creditBreakdown.totalTax?.toLocaleString() || '0'}</span>
            </div>
          )}
          
          <div className="summary-item total">
            <span>Final Total:</span>
            <strong>₹{creditBreakdown.finalTotal?.toLocaleString() || totals?.finalTotal?.toLocaleString() || '0'}</strong>
          </div>

          {discount > 0 && creditBreakdown.totalDiscount > 0 && (
            <div className="savings-note">
              🎉 Customer saved ₹{creditBreakdown.totalDiscount.toLocaleString()} with {discount}% discount!
            </div>
          )}
        </div>

        {/* Items List with Calculation Details */}
        <div className="checkout-items">
          <h3>Items ({cartItems?.length || 0})</h3>
          <div className="items-list">
            {cartItems?.map((item, index) => {
              const breakdown = calculateItemBreakdown(item);
              const product = item.productDetails || {};
              
              return (
                <div key={index} className="checkout-item">
                  <div className="item-info">
                    <h4>{item.item_name || product.name || `Product ${item.product_id}`}</h4>
                    <div className="item-details">
                      <span>Qty: {item.quantity}</span>
                      <span>× ₹{breakdown.basePrice.toLocaleString()}</span>
                      {product.unit && <span className="unit">/{product.unit}</span>}
                    </div>
                    <div className="item-gst-info">
                      <span className={`gst-badge ${breakdown.isInclusiveGST ? 'inclusive' : 'exclusive'}`}>
                        {breakdown.isInclusiveGST ? 'Incl. GST' : 'Excl. GST'} {breakdown.gstRate}%
                      </span>
                    </div>
                    {item.credit_period > 0 && (
                      <p className="credit-info">
                        Credit: {item.credit_period} days (+{item.credit_percentage}%)
                      </p>
                    )}
                    
                    {/* Item Calculation Breakdown */}
                    <div className="item-breakdown">
                      <div className="breakdown-row">
                        <span>Base:</span>
                        <span>₹{breakdown.totalBaseAmount.toLocaleString()}</span>
                      </div>
                      {breakdown.totalCreditCharges > 0 && (
                        <div className="breakdown-row credit">
                          <span>Credit Charge:</span>
                          <span>+₹{breakdown.totalCreditCharges.toLocaleString()}</span>
                        </div>
                      )}
                      {breakdown.discountAmount > 0 && (
                        <div className="breakdown-row discount">
                          <span>Discount:</span>
                          <span>-₹{breakdown.discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      {breakdown.taxAmount > 0 && (
                        <div className="breakdown-row tax">
                          <span>GST:</span>
                          <span>+₹{breakdown.taxAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="breakdown-row item-total">
                        <span>Item Total:</span>
                        <strong>₹{breakdown.finalPayableAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Info */}
        <div className="staff-info-section">
          <h3>Order Placed By</h3>
          <p>Staff ID: <strong>{initialStaffId || "Loading..."}</strong></p>
          <p>Role: <strong>{userRole || "Staff"}</strong></p>
          <p className="order-mode-display">
            Order Mode: <strong className={`order-mode-indicator ${orderMode === 'PAKKA' ? 'pakka' : 'kacha'}`}>
              {orderMode}
            </strong>
          </p>
        </div>

        {/* Place Order Button */}
        <div className="place-order-section">
          <button 
            onClick={handlePlaceOrder}
            disabled={loading || !cartItems || cartItems.length === 0}
            className={`place-order-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? "Processing..." : `Place ${orderMode} Order - ₹${creditBreakdown.finalTotal?.toLocaleString() || totals?.finalTotal?.toLocaleString() || '0'}`}
          </button>
          {/* <p className="payment-note">
            Note: Order will be placed under staff ID: {initialStaffId || "Current User"} as {orderMode} order
          </p> */}
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default Checkout;
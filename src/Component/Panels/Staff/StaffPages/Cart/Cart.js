import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./Cart.css";

function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [retailerId, setRetailerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [retailermail, setMail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [creditPeriods, setCreditPeriods] = useState([]);
  const [creditLoading, setCreditLoading] = useState(true);
  const [productDetails, setProductDetails] = useState({});
  const [editingPriceForItem, setEditingPriceForItem] = useState(null); // Track which item's price is being edited
  const [editedPrice, setEditedPrice] = useState(""); // Store the edited price value


  // Get logged-in user
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    const user = storedData ? JSON.parse(storedData) : null;
    setStaffId(user?.id || null);
    setUserRole(user?.role || "");
  }, []);

  // Get retailer info from location state
  useEffect(() => {
    if (location.state) {
      setRetailerId(location.state.retailerId || "");
      setCustomerName(location.state.customerName || "");
      setDiscount(location.state.discount || 0);
      setMail(location.state.retailermail || 0);
    }
  }, [location.state]);

  // Fetch product details for cart items
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${baseurl}/get-sales-products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        const products = Array.isArray(result) ? result : (result.data || []);
        
        // Create a map of product details with MRP and sale price
        const productMap = {};
        products.forEach(product => {
          productMap[product.id] = {
            name: product.name,
            unit: product.unit,
            gst_rate: parseFloat(product.gst_rate) || 0,
            price: parseFloat(product.price) || 0, // This is sale_price
            mrp: parseFloat(product.mrp) ,
            inclusive_gst: product.inclusive_gst || "Exclusive"
          };
        });
        
        setProductDetails(productMap);
      } catch (err) {
        console.error("Error fetching product details:", err);
      }
    };

    fetchProductDetails();
  }, []);

  // Fetch credit periods
  useEffect(() => {
    const fetchCreditPeriods = async () => {
      try {
        setCreditLoading(true);
        const response = await fetch(`${baseurl}/api/credit-period-fix/credit`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setCreditPeriods(result.data);
        } else {
          throw new Error("Invalid credit periods data format");
        }
      } catch (err) {
        console.error("Error fetching credit periods:", err);
      } finally {
        setCreditLoading(false);
      }
    };

    fetchCreditPeriods();
  }, []);

  // Fetch cart items from backend
  const fetchCartItems = async () => {
    if (!retailerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const items = await response.json();
      setCartItems(items || []);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (retailerId) {
      fetchCartItems();
    }
  }, [retailerId]);

  // Update quantity in cart
  const updateQuantityInCart = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const response = await fetch(`${baseurl}/api/cart/update-cart-quantity/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity");
    }
  };

  // Update edited_sale_price in cart
   const updatePriceInCart = async (itemId, newPrice) => {
    try {
      // Validate price
      const price = parseFloat(newPrice);
      if (isNaN(price) || price < 0) {
        alert("Please enter a valid price");
        return false;
      }

      const response = await fetch(`${baseurl}/api/cart/update-cart-price/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: price }),
      });

      if (!response.ok) throw new Error("Failed to update price");
      
      // Exit edit mode
      setEditingPriceForItem(null);
      setEditedPrice("");
      
      // Refresh cart items
      fetchCartItems();
      return true;
    } catch (err) {
      console.error("Error updating price:", err);
      alert(err.message || "Failed to update price");
      return false;
    }
  };

  // Start editing price for an item
  const startEditingPrice = (itemId, currentPrice) => {
    setEditingPriceForItem(itemId);
    setEditedPrice(currentPrice.toString());
  };

  // Handle price input change
  const handlePriceInputChange = (e) => {
    setEditedPrice(e.target.value);
  };

  // Handle price input blur (save on click outside or enter)
  const handlePriceInputBlur = (itemId) => {
    if (editedPrice.trim() !== "") {
      updatePriceInCart(itemId, editedPrice);
    } else {
      setEditingPriceForItem(null);
      setEditedPrice("");
    }
  };

  // Handle price input key press (save on Enter)
  const handlePriceInputKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      if (editedPrice.trim() !== "") {
        updatePriceInCart(itemId, editedPrice);
      }
    } else if (e.key === 'Escape') {
      setEditingPriceForItem(null);
      setEditedPrice("");
    }
  };

  // Update credit period for individual item
  const updateItemCreditPeriod = async (itemId, creditPeriod, creditPercentage) => {
    try {
      const response = await fetch(`${baseurl}/api/cart/update-cart-credit/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          credit_period: creditPeriod,
          credit_percentage: creditPercentage
        }),
      });

      if (!response.ok) throw new Error("Failed to update credit period");
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error updating credit period:", err);
      alert("Failed to update credit period");
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`${baseurl}/api/cart/remove-cart-item/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");
      
      // Refresh cart items
      fetchCartItems();
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item");
    }
  };

  // CALCULATION FUNCTIONS - Updated to match the Cart component logic
  const calculateItemBreakdown = (item) => {
    const product = productDetails[item.product_id] || {};
    
    // Get MRP and sale prices
    const mrp = product.mrp || 0;
    const salePrice = product.price || 0; // This is the regular sale price from database
    
    // Use edited_sale_price if available in cart item, otherwise from product details
    const editedSalePrice = parseFloat(item.price) ;
    
    const gstRate = parseFloat(product.gst_rate) || 0;
    const isInclusiveGST = product.inclusive_gst === "Inclusive";
    const quantity = item.quantity || 1;
    const creditPercentage = item.credit_percentage || 0;
    const creditPeriod = item.credit_period || 0;
    const discountPercentage = parseFloat(discount) || 0;

    // Calculate credit charge (percentage of edited_sale_price)
    const creditChargePerUnit = (editedSalePrice * creditPercentage) / 100;

    // Calculate customer sale price
    const customerSalePricePerUnit = editedSalePrice + creditChargePerUnit;

    // Calculate discount (percentage of customer_sale_price)
    const discountAmountPerUnit = (customerSalePricePerUnit * discountPercentage) / 100;

    // Calculate item total (before tax)
    const itemTotalPerUnit = customerSalePricePerUnit - discountAmountPerUnit;

    // Calculate tax (GST handling based on inclusive/exclusive)
    let taxableAmountPerUnit = 0;
    let taxAmountPerUnit = 0;

    if (isInclusiveGST) {
      // If GST is inclusive, extract taxable amount from item_total
      taxableAmountPerUnit = itemTotalPerUnit / (1 + (gstRate / 100));
      taxAmountPerUnit = itemTotalPerUnit - taxableAmountPerUnit;
    } else {
      // If GST is exclusive, item_total is taxable amount
      taxableAmountPerUnit = itemTotalPerUnit;
      taxAmountPerUnit = (taxableAmountPerUnit * gstRate) / 100;
    }

    // Calculate CGST/SGST (split equally)
    const sgstPercentage = gstRate / 2;
    const cgstPercentage = gstRate / 2;
    const sgstAmountPerUnit = taxAmountPerUnit / 2;
    const cgstAmountPerUnit = taxAmountPerUnit / 2;

    // Calculate final amount per unit (including tax if exclusive)
    const finalAmountPerUnit = isInclusiveGST ? itemTotalPerUnit : itemTotalPerUnit + taxAmountPerUnit;

    return {
      // Per unit values
      mrp,
      sale_price: salePrice,
      edited_sale_price: editedSalePrice,
      credit_charge: creditChargePerUnit,
      credit_period: creditPeriod,
      credit_percentage: creditPercentage,
      customer_sale_price: customerSalePricePerUnit,
      discount_percentage: discountPercentage,
      discount_amount: discountAmountPerUnit,
      item_total: itemTotalPerUnit,
      taxable_amount: taxableAmountPerUnit,
      tax_percentage: gstRate,
      tax_amount: taxAmountPerUnit,
      sgst_percentage: sgstPercentage,
      sgst_amount: sgstAmountPerUnit,
      cgst_percentage: cgstPercentage,
      cgst_amount: cgstAmountPerUnit,
      final_amount: finalAmountPerUnit,
      total_amount: finalAmountPerUnit * quantity,
      
      // For display purposes
      isInclusiveGST,
      quantity,
      
      // Totals for the entire quantity
      totals: {
        totalMRP: mrp * quantity,
        totalSalePrice: salePrice * quantity,
        totalEditedSalePrice: editedSalePrice * quantity,
        totalCreditCharge: creditChargePerUnit * quantity,
        totalCustomerSalePrice: customerSalePricePerUnit * quantity,
        totalDiscountAmount: discountAmountPerUnit * quantity,
        totalItemTotal: itemTotalPerUnit * quantity,
        totalTaxableAmount: taxableAmountPerUnit * quantity,
        totalTaxAmount: taxAmountPerUnit * quantity,
        totalSgstAmount: sgstAmountPerUnit * quantity,
        totalCgstAmount: cgstAmountPerUnit * quantity,
        finalPayableAmount: finalAmountPerUnit * quantity
      }
    };
  };

  // Calculate totals for the entire cart
  const calculateCartTotals = () => {
    let subtotal = 0;
    let totalCreditCharges = 0;
    let totalCustomerSalePrice = 0;
    let totalDiscount = 0;
    let totalItemTotal = 0;
    let totalTaxableAmount = 0;
    let totalTax = 0;
    let totalSgst = 0;
    let totalCgst = 0;
    let finalTotal = 0;
    let itemCount = 0;

    cartItems.forEach(item => {
      const breakdown = calculateItemBreakdown(item);
      
      subtotal += breakdown.totals.totalEditedSalePrice;
      totalCreditCharges += breakdown.totals.totalCreditCharge;
      totalCustomerSalePrice += breakdown.totals.totalCustomerSalePrice;
      totalDiscount += breakdown.totals.totalDiscountAmount;
      totalItemTotal += breakdown.totals.totalItemTotal;
      totalTaxableAmount += breakdown.totals.totalTaxableAmount;
      totalTax += breakdown.totals.totalTaxAmount;
      totalSgst += breakdown.totals.totalSgstAmount;
      totalCgst += breakdown.totals.totalCgstAmount;
      finalTotal += breakdown.totals.finalPayableAmount;
      itemCount += breakdown.quantity;
    });

    return {
      subtotal,
      totalCreditCharges,
      totalCustomerSalePrice,
      totalDiscount,
      totalItemTotal,
      totalTaxableAmount,
      totalTax,
      totalSgst,
      totalCgst,
      finalTotal,
      itemCount,
      userDiscount: discount
    };
  };

  const totals = calculateCartTotals();

  // Proceed to checkout
const handleProceedToCheckout = () => {
  if (cartItems.length === 0) {
    alert("Cart is empty. Add items before checkout.");
    return;
  }

  const checkoutItems = cartItems.map(item => {
    const breakdown = calculateItemBreakdown(item);
    const product = productDetails[item.product_id] || {};
    
    // Create comprehensive breakdown object
    const breakdownObj = {
      perUnit: {
        mrp: breakdown.mrp,
        sale_price: breakdown.sale_price,
        edited_sale_price: breakdown.edited_sale_price,
        credit_charge: breakdown.credit_charge,
        credit_period: breakdown.credit_period,
        credit_percentage: breakdown.credit_percentage,
        customer_sale_price: breakdown.customer_sale_price,
        discount_percentage: breakdown.discount_percentage,
        discount_amount: breakdown.discount_amount,
        item_total: breakdown.item_total,
        taxable_amount: breakdown.taxable_amount,
        tax_percentage: breakdown.tax_percentage,
        tax_amount: breakdown.tax_amount,
        sgst_percentage: breakdown.sgst_percentage,
        sgst_amount: breakdown.sgst_amount,
        cgst_percentage: breakdown.cgst_percentage,
        cgst_amount: breakdown.cgst_amount,
        final_amount: breakdown.final_amount,
        total_amount: breakdown.total_amount,
        isInclusiveGST: breakdown.isInclusiveGST
      },
      
      // Totals for the quantity
      totals: {
        totalMRP: breakdown.totals.totalMRP,
        totalSalePrice: breakdown.totals.totalSalePrice,
        totalEditedSalePrice: breakdown.totals.totalEditedSalePrice,
        totalCreditCharge: breakdown.totals.totalCreditCharge,
        totalCustomerSalePrice: breakdown.totals.totalCustomerSalePrice,
        totalDiscountAmount: breakdown.totals.totalDiscountAmount,
        totalItemTotal: breakdown.totals.totalItemTotal,
        totalTaxableAmount: breakdown.totals.totalTaxableAmount,
        totalTaxAmount: breakdown.totals.totalTaxAmount,
        totalSgstAmount: breakdown.totals.totalSgstAmount,
        totalCgstAmount: breakdown.totals.totalCgstAmount,
        finalPayableAmount: breakdown.totals.finalPayableAmount
      },
      
      // Quantity
      quantity: breakdown.quantity
    };

    return {
      // Original cart item fields
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity || 1,
      price: item.price || breakdown.edited_sale_price,
      credit_period: item.credit_period || 0,
      credit_percentage: item.credit_percentage || 0,
      
      // Additional fields needed for checkout
      item_name: product.name || `Product ${item.product_id}`,
      product_details: product,
      breakdown: breakdownObj
    };
  });

  navigate("/staff/checkout", {
    state: {
      retailerId,
      customerName,
      discount,
      retailermail,
      cartItems: checkoutItems, // This now includes full breakdown
      staffId: userRole === 'staff' ? staffId : null,
      userRole,
      totals: totals,
      orderTotals: totals,
      userDiscountPercentage: discount,
      creditPeriods // Pass credit periods if needed
    }
  });
};

  // Continue shopping
  const handleContinueShopping = () => {
    navigate("/staff/place-sales-order", {
      state: {
        retailerId,
        discount,
        customerName
      }
    });
  };

  return (
    <StaffMobileLayout>
      <div className="cart-page">
        {/* Header */}
        <div className="cart-header">
          <button 
            className="shopping-back-btn"
            onClick={handleContinueShopping}
          >
            ← 
          </button>
          <h1>Shopping Cart 🛒</h1>
          {customerName && (
            <div className="customer-info">
              Customer: <strong>{customerName}</strong>
              {discount > 0 && (
                <span className="discount-badge"> - {discount}% Discount</span>
              )}
            </div>
          )}
        </div>
       

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <p>Loading cart items...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button onClick={fetchCartItems} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Empty Cart */}
        {!loading && cartItems.length === 0 && (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add products from the order page</p>
            <button onClick={handleContinueShopping} className="continue-shopping-btn">
              Continue Shopping
            </button>
          </div>
        )}

        {/* Cart Items with Edited Sale Price Editing */}
        {!loading && cartItems.length > 0 && (
          <div className="cart-items-container">
            <h2>Cart Items ({cartItems.length})</h2>
            
            <div className="cart-items-list">
              {cartItems.map(item => {
                const breakdown = calculateItemBreakdown(item);
                const product = productDetails[item.product_id] || {};
                const finalPayableAmount = breakdown.totals.finalPayableAmount;
                
                return (
                  <div key={item.id} className="cart-item-card">
                    <div className="item-main-info">
                      <div className="item-header">
                        <h4>{product.name || `Product ${item.product_id}`}</h4>
                        
                        {/* Edited Sale Price Display/Edit - Click to edit */}
                        <div className="price-edit-container">
                          {editingPriceForItem === item.id ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editedPrice}
                              onChange={handlePriceInputChange}
                              onBlur={() => handlePriceInputBlur(item.id)}
                              onKeyDown={(e) => handlePriceInputKeyPress(e, item.id)}
                              className="price-edit-input"
                              autoFocus
                              placeholder="Enter sale price"
                            />
                          ) : (
                            <div 
                              className="price-display clickable-price"
                              onClick={() => startEditingPrice(item.id, breakdown.edited_sale_price)}
                              title="Click to edit sale price"
                            >
                              <span className="price-label">Sale Price: </span>
                              <span className="price-value">₹{breakdown.edited_sale_price.toLocaleString('en-IN')}</span>
                              <span className="price-edit-hint">✏️</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="item-details">
                        {product.unit && <span className="unit">/{product.unit}</span>}
                        <span className={`gst-badge ${breakdown.isInclusiveGST ? 'inclusive' : 'exclusive'}`}>
                          {breakdown.isInclusiveGST ? 'Incl. GST' : 'Excl. GST'} {breakdown.tax_percentage}%
                        </span>
                        
                      </div>
                      
                      {/* Credit Period Selector for each item */}
                      <div className="item-credit-control">
                        <label>Credit Period:</label>
                        <select
                          value={item.credit_period || 0}
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue === "0") {
                              updateItemCreditPeriod(item.id, 0, 0);
                            } else {
                              const selectedPeriod = creditPeriods.find(
                                p => p.credit_period?.toString() === selectedValue
                              );
                              if (selectedPeriod) {
                                updateItemCreditPeriod(
                                  item.id, 
                                  selectedPeriod.credit_period, 
                                  selectedPeriod.credit_percentage
                                );
                              }
                            }
                          }}
                          className="credit-period-select"
                        >
                          <option value="0">No Credit Period</option>
                          {creditPeriods.map(period => (
                            <option 
                              key={period.credit_period} 
                              value={period.credit_period?.toString()}
                            >
                              {period.credit_period} days (+{period.credit_percentage}%)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Credit Period Indicator */}
                      {breakdown.credit_period > 0 && (
                        <div className="credit-badge">
                          Credit: {breakdown.credit_period} days (+{breakdown.credit_percentage}%)
                        </div>
                      )}

                      {/* Item Calculation Breakdown */}
                      <div className="calculation-breakdown">
                        
                        
                        {/* Taxable Amount */}
                        <div className="breakdown-row">
                          <span>Taxable Amount:</span>
                          <span>₹{breakdown.taxable_amount.toLocaleString('en-IN')}</span>
                        </div>
                        
                       
                          
                            <div className="breakdown-row tax">
                              <span>GST ({breakdown.tax_percentage}%):</span>
                              <span>+₹{breakdown.tax_amount.toLocaleString('en-IN')}</span>
                            </div>
                          
                        
                        {/* Final Amount */}
                        <div className="breakdown-row total">
                          <span>Final Amount:</span>
                          <span className="item-total-amount">
                            ₹{breakdown.final_amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        
                        {/* Quantity Multiplier Note */}
                        <div className="breakdown-row-note">
                          × {breakdown.quantity} units = ₹{finalPayableAmount.toLocaleString('en-IN')} total
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantityInCart(item.id, Math.max(1, (item.quantity || 1) - 1))}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantityInCart(item.id, (item.quantity || 1) + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>

                      <div className="per-unit-price">
                        ₹{(breakdown.final_amount).toFixed(2)} per unit
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              
             
              {totals.totalCreditCharges > 0 && (
                <div className="summary-row credit-charges">
                  <span>Total Credit Charges:</span>
                  <span>+₹{totals.totalCreditCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
           
              {totals.totalDiscount > 0 && (
                <div className="summary-row discount">
                  <span>Customer Discount ({discount}%):</span>
                  <span>-₹{totals.totalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
    
              
              {totals.totalTax > 0 && (
                <>
                  <div className="summary-row">
                    <span>Total Taxable Amount:</span>
                    <span>₹{totals.totalTaxableAmount.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="summary-row tax">
                    <span>Total GST:</span>
                    <span>+₹{totals.totalTax.toLocaleString('en-IN')}</span>
                  </div>
                 
                </>
              )}
              
              <div className="summary-row total">
                <span>Final Total:</span>
                <span className="final-total">₹{totals.finalTotal.toLocaleString('en-IN')}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="savings-note">
                  🎉 Customer saved ₹{totals.totalDiscount.toLocaleString('en-IN')} with {discount}% discount!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="cart-actions">
              <button onClick={handleContinueShopping} className="continue-btn">
                ← Add More Items
              </button>
              <button onClick={handleProceedToCheckout} className="checkout-btn">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>
    </StaffMobileLayout>
  );
}

export default CartPage;
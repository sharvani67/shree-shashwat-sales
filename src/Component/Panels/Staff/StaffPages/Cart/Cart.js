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
  const [staffId, setStaffId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [creditPeriods, setCreditPeriods] = useState([]);
  const [creditLoading, setCreditLoading] = useState(true);
  const [productDetails, setProductDetails] = useState({}); // Store product details

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
        
        // Create a map of product details
        const productMap = {};
        products.forEach(product => {
          productMap[product.id] = {
            name: product.name,
            unit: product.unit,
            gst_rate: product.gst_rate,
            price: product.price
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

  // Calculate totals with proper price handling
  const calculateTotals = () => {
    let subtotal = 0;
    let creditCharges = 0;

    cartItems.forEach(item => {
      // Use product price from productDetails if available, otherwise use cart item price
      const price = productDetails[item.product_id]?.price || item.price || 0;
      const quantity = item.quantity || 1;
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      
      // Calculate credit charges if any
      if (item.credit_percentage && item.credit_percentage > 0) {
        creditCharges += itemTotal * (item.credit_percentage / 100);
      }
    });

    const discountAmount = subtotal * (discount / 100);
    const finalTotal = subtotal + creditCharges - discountAmount;

    return {
      subtotal,
      creditCharges,
      discountAmount,
      finalTotal,
      itemCount: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    };
  };

  const totals = calculateTotals();

  // Proceed to checkout
  // In CartPage.js - update the handleProceedToCheckout function
const handleProceedToCheckout = () => {
  if (cartItems.length === 0) {
    alert("Cart is empty. Add items before checkout.");
    return;
  }

  navigate("/staff/checkout", {
    state: {
      retailerId,
      customerName,
      discount,
      cartItems: cartItems.map(item => ({
        ...item,
        item_name: productDetails[item.product_id]?.name || `Product ${item.product_id}`,
        price: productDetails[item.product_id]?.price || item.price || 0
      })),
      staffId: userRole === 'staff' ? staffId : null,
      userRole,
      totals: totals // Already calculated
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
            className="back-btn"
            onClick={handleContinueShopping}
          >
            ← Continue Shopping
          </button>
          <h1>🛒 Shopping Cart</h1>
          {customerName && (
            <div className="customer-info">
              Customer: <strong>{customerName}</strong>
            </div>
          )}
        </div>

        {/* Cart Summary Bar */}
        <div className="cart-summary-bar">
          <div className="summary-item">
            <span>Items:</span>
            <span className="count">{totals.itemCount}</span>
          </div>
          <div className="summary-item">
            <span>Total:</span>
            <span className="price">₹{totals.finalTotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="summary-item">
              <span>Discount:</span>
              <span className="discount">-{discount}%</span>
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

        {/* Cart Items with Credit Period Selection */}
        {!loading && cartItems.length > 0 && (
          <div className="cart-items-container">
            <h2>Cart Items ({cartItems.length})</h2>
            
            {!creditLoading && creditPeriods.length > 0 && (
              <div className="credit-period-section">
                <h3>Select Credit Period for Items</h3>
                <p className="credit-period-note">You can apply credit period to individual items below</p>
              </div>
            )}
            
            <div className="cart-items-list">
              {cartItems.map(item => {
                const product = productDetails[item.product_id] || {};
                const price = product.price || item.price || 0;
                const itemTotal = price * (item.quantity || 1);
                
                return (
                  <div key={item.id} className="cart-item-card">
                    <div className="item-main-info">
                      <h4>{product.name || `Product ${item.product_id}`}</h4>
                      <div className="item-details">
                        <span className="price">₹{price.toLocaleString()}</span>
                        {product.unit && <span className="unit">/{product.unit}</span>}
                        {product.gst_rate && (
                          <span className="gst-badge">GST: {product.gst_rate}%</span>
                        )}
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
                              {period.credit_period} days ({period.credit_percentage}% charge)
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Credit Period Indicator */}
                      {item.credit_period > 0 && (
                        <div className="credit-badge">
                          Credit: {item.credit_period} days ({item.credit_percentage}%)
                        </div>
                      )}
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

                      <div className="item-total">
                        ₹{itemTotal.toLocaleString()}
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
              
              <div className="summary-row">
                <span>Subtotal ({totals.itemCount} items):</span>
                <span>₹{totals.subtotal.toLocaleString()}</span>
              </div>
              
              {totals.creditCharges > 0 && (
                <div className="summary-row credit-charges">
                  <span>Credit Charges:</span>
                  <span>+₹{totals.creditCharges.toLocaleString()}</span>
                </div>
              )}
              
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({discount}%):</span>
                  <span>-₹{totals.discountAmount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="summary-row total">
                <span>Final Total:</span>
                <span className="final-total">₹{totals.finalTotal.toLocaleString()}</span>
              </div>
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
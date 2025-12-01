import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./PlaceSalesOrder.css";

function PlaceSalesOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [creditPeriods, setCreditPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditLoading, setCreditLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreditPeriod, setSelectedCreditPeriod] = useState("");

  // Get retailer ID and discount from navigation state
  const retailerId = location.state?.retailerId;
  const retailerDiscount = location.state?.discount || 0;

  // Get logged-in user
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const staffId = user?.id || null;

  // Fetch sales products
  useEffect(() => {
    const fetchSalesProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${baseurl}/get-sales-products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log("Products API Response:", result);
        
        if (Array.isArray(result)) {
          setProducts(result);
        } else if (result.data && Array.isArray(result.data)) {
          setProducts(result.data);
        } else {
          throw new Error("Invalid products data format");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesProducts();
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
        
        console.log("Credit Periods API Response:", result);
        
        if (result.success && Array.isArray(result.data)) {
          setCreditPeriods(result.data);
          // Set default credit period to first option
          if (result.data.length > 0) {
            setSelectedCreditPeriod(result.data[0].credit_period?.toString() || "");
          }
        } else {
          throw new Error("Invalid credit periods data format");
        }
      } catch (err) {
        console.error("Error fetching credit periods:", err);
        // Continue without credit periods if API fails
      } finally {
        setCreditLoading(false);
      }
    };

    fetchCreditPeriods();
  }, []);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected credit period details
  const getSelectedCreditDetails = () => {
    if (!selectedCreditPeriod) return null;
    return creditPeriods.find(period => 
      period.credit_period?.toString() === selectedCreditPeriod
    );
  };

  // Calculate credit charges for an item
  const calculateCreditCharges = (item) => {
    const creditDetails = getSelectedCreditDetails();
    if (!creditDetails || !creditDetails.credit_percentage) return 0;
    
    const itemTotal = item.price * item.quantity;
    return itemTotal * (creditDetails.credit_percentage / 100);
  };

  // Calculate discount amount
  const calculateDiscount = (subtotal) => {
    return subtotal * (retailerDiscount / 100);
  };

  // Add product to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            unit: product.unit,
            quantity: 1,
            category: product.category,
            supplier: product.supplier
          }
        ];
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Update quantity in cart
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Calculate amounts
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const creditCharges = cart.reduce((total, item) => total + calculateCreditCharges(item), 0);
  const discountAmount = calculateDiscount(subtotal + creditCharges);
  const finalTotal = subtotal + creditCharges - discountAmount;

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!retailerId) {
      alert("Retailer information is missing. Please go back and try again.");
      return;
    }

    if (cart.length === 0) {
      alert("Please add at least one product to place an order.");
      return;
    }

    try {
      const creditDetails = getSelectedCreditDetails();
      
      const orderData = {
        retailer_id: retailerId,
        staff_id: staffId,
        credit_period: selectedCreditPeriod ? parseInt(selectedCreditPeriod) : 0,
        credit_percentage: creditDetails?.credit_percentage || 0,
        discount_percentage: retailerDiscount,
        discount_amount: discountAmount,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
          total_amount: item.price * item.quantity,
          credit_charges: calculateCreditCharges(item)
        })),
        subtotal: subtotal,
        credit_charges: creditCharges,
        discount_amount: discountAmount,
        total_amount: finalTotal,
        order_date: new Date().toISOString().split('T')[0]
      };

      console.log("Placing order:", orderData);

      const response = await fetch(`${baseurl}/api/sales-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("Order placed successfully!");
        setCart([]);
        navigate("/staff/my-retailers");
      } else {
        throw new Error(result.error || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  if (!retailerId) {
    return (
      <StaffMobileLayout>
        <div className="staff-place-sales-order">
          <div className="staff-error-container">
            <h2>Retailer Not Found</h2>
            <p>Please go back and select a retailer to place an order.</p>
            <button 
              className="staff-back-retailers-btn"
              onClick={() => navigate("/staff/my-retailers")}
            >
              Back to Retailers
            </button>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="staff-place-sales-order">
        
        {/* Header */}
        <div className="staff-order-header">
          <div className="staff-header-content">
            <div className="staff-header-text">
              <h1>Place Sales Order</h1>
              <p>Select products and quantities for your retailer</p>
              {retailerDiscount > 0 && (
                <p className="staff-retailer-discount">
                  Retailer Discount: {retailerDiscount}%
                </p>
              )}
            </div>
            <button 
              className="staff-back-btn"
              onClick={() => navigate("/staff/my-retailers")}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="staff-search-section">
          <input
            type="text"
            placeholder="Search products by name, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="staff-search-input"
          />
        </div>

        {/* Credit Period Selection */}
        {!creditLoading && creditPeriods.length > 0 && (
          <div className="staff-credit-period-section">
            <label htmlFor="credit-period" className="staff-credit-period-label">
              Select Credit Period:
            </label>
            <select
              id="credit-period"
              value={selectedCreditPeriod}
              onChange={(e) => setSelectedCreditPeriod(e.target.value)}
              className="staff-credit-period-select"
            >
              <option value="">No Credit Period</option>
              {creditPeriods.map(period => (
                <option 
                  key={period.credit_period} 
                  value={period.credit_period?.toString()}
                >
                  {period.credit_period} days ({period.credit_percentage}%)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Content */}
        <div className="staff-order-content">
          
          {/* Products Section */}
          <div className="staff-products-section">
            <h2>Available Products ({filteredProducts.length})</h2>
            
            {loading && <p className="staff-loading">Loading products...</p>}
            {error && <p className="staff-error">{error}</p>}
            
            <div className="staff-products-grid">
              {!loading && filteredProducts.length === 0 && !error && (
                <p className="staff-no-products">No products found matching your search.</p>
              )}
              
              {!loading && filteredProducts.map(product => (
                <div key={product.id} className="staff-product-card">
                  <div className="staff-product-info">
                    <h3>{product.name}</h3>
                    <p className="staff-product-category">{product.category}</p>
                    <p className="staff-product-price">₹{parseFloat(product.price).toLocaleString()} / {product.unit}</p>
                    <p className="staff-product-gst">GST: {product.gst_rate}% ({product.inclusive_gst})</p>
                  </div>
                  <button
                    className="staff-add-to-cart-btn"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="staff-cart-section">
            <h2>Order Cart ({cart.length})</h2>
            
            {cart.length === 0 ? (
              <p className="staff-empty-cart">No items in cart</p>
            ) : (
              <div className="staff-cart-items">
                {cart.map(item => {
                  const itemCreditCharges = calculateCreditCharges(item);
                  const itemSubtotal = item.price * item.quantity;
                  
                  return (
                    <div key={item.id} className="staff-cart-item">
                      <div className="staff-item-info">
                        <h4>{item.name}</h4>
                        <p>₹{item.price.toLocaleString()} / {item.unit}</p>
                        <p className="staff-item-category">{item.category}</p>
                        {itemCreditCharges > 0 && (
                          <p className="staff-item-credit">
                            Credit Charges: +₹{itemCreditCharges.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="staff-quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="staff-quantity-btn"
                        >
                          -
                        </button>
                        <span className="staff-quantity">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="staff-quantity-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="staff-item-total">
                        ₹{(itemSubtotal + itemCreditCharges).toLocaleString()}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="staff-remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                
                {/* Order Summary */}
                <div className="staff-order-summary">
                  <div className="staff-summary-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {creditCharges > 0 && (
                    <div className="staff-summary-row staff-credit-charges">
                      <span>Credit Charges:</span>
                      <span className="staff-credit-amount">
                        +₹{creditCharges.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {discountAmount > 0 && (
                    <div className="staff-summary-row staff-discount">
                      <span>Discount ({retailerDiscount}%):</span>
                      <span className="staff-discount-amount">
                        -₹{discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="staff-summary-row staff-final-total">
                    <span>Final Total:</span>
                    <span className="staff-total-amount">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    className="staff-place-order-btn"
                    disabled={cart.length === 0}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default PlaceSalesOrder;
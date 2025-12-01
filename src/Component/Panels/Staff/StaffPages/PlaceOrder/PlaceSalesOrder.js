import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./PlaceSalesOrder.css";

function PlaceSalesOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [retailerInfo, setRetailerInfo] = useState({});

  // Get retailer ID and discount from navigation state
  const retailerId = location.state?.retailerId;
  const retailerDiscount = location.state?.discount || 0;
  const customerName = location.state?.customerName || "";

  // Get logged-in user
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const staffId = user?.id || null;

  // Fetch cart items on load (just to get count)
  useEffect(() => {
    if (!retailerId) return;

    const fetchCartItems = async () => {
      try {
        const response = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const cartItems = await response.json();
        setCart(cartItems || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCartItems();
  }, [retailerId]);

  // Fetch retailer info
  useEffect(() => {
    if (!retailerId) return;

    const fetchRetailerInfo = async () => {
      try {
        const response = await fetch(`${baseurl}/get-sales-retailers/${staffId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          const retailer = result.data.find(r => r.id === parseInt(retailerId));
          if (retailer) {
            setRetailerInfo({
              name: retailer.name,
              business: retailer.business_name,
              location: retailer.shipping_city
            });
          }
        }
      } catch (err) {
        console.error("Error fetching retailer info:", err);
      }
    };

    if (staffId) {
      fetchRetailerInfo();
    }
  }, [retailerId, staffId]);

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

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add product to cart via backend
  const addToCart = async (product) => {
    try {
      // First check if product is already in cart
      const existingItem = cart.find(item => item.product_id === product.id);
      
      // Get logged-in user info
      const storedData = localStorage.getItem("user");
      const user = storedData ? JSON.parse(storedData) : null;
      
      if (existingItem) {
        // Update quantity
        const response = await fetch(`${baseurl}/api/cart/update-cart-quantity/${existingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            quantity: existingItem.quantity + 1 
          }),
        });

        if (!response.ok) throw new Error("Failed to update quantity");
      } else {
        // Add new item with NO credit period by default
        const requestBody = {
          customer_id: retailerId,
          product_id: product.id,
          quantity: 1,
          credit_period: 0, // Default no credit period
          credit_percentage: 0 // Default no credit percentage
        };
        
        // Add staff_id if the user is a staff member
        if (user?.role === 'staff') {
          requestBody.staff_id = user.id;
        }
        
        const response = await fetch(`${baseurl}/api/cart/add-to-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to add to cart");
      }

      // Refresh cart from backend
      const cartResponse = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);
      const refreshedCart = await cartResponse.json();
      setCart(refreshedCart || []);

    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add item to cart");
    }
  };

  // Cart count
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (!retailerId) {
    return (
      <StaffMobileLayout>
        <div className="staff-place-sales-order">
          <div className="staff-error-container">
            <h2>Retailer Not Found</h2>
            <p>Please go back and select a retailer to place an order.</p>
            <button 
              className="staff-back-retailers-btn"
              onClick={() => navigate("/staff/retailers")}
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
        
        {/* Header with Cart Icon */}
        <div className="staff-order-header">
          <div className="staff-header-content">
            <div className="staff-header-main">
              <button 
                className="staff-back-btn"
                onClick={() => navigate("/staff/my-retailers")}
              >
                ← Back
              </button>
              <div className="staff-header-text">
                <h1>Place Sales Order</h1>
                {retailerInfo.name && (
                  <p className="staff-retailer-name">For: {retailerInfo.name}</p>
                )}
              </div>
            </div>
            
            {/* Cart Button - Direct link to Cart Page */}
            <Link 
              to="/staff/cart" 
              state={{ 
                retailerId, 
                discount: retailerDiscount,
                customerName: retailerInfo.name || customerName
              }}
              className="staff-cart-btn"
            >
              🛒
              {cartCount > 0 && (
                <span className="staff-cart-count">{cartCount}</span>
              )}
            </Link>
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
                    <div className="product-stock-info">
                      <p className="staff-product-gst">GST: {product.gst_rate}%</p>
                      {product.balance_stock && (
                        <p className="stock-indicator">
                          Stock: {product.balance_stock}
                        </p>
                      )}
                    </div>
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
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default PlaceSalesOrder;
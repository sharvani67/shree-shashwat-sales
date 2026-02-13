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
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  const retailerId = location.state?.retailerId;
  const retailerDiscount = parseFloat(location.state?.retailerDiscount) || 0; // Changed from discount to retailerDiscount
  const customerName = location.state?.customerName || "";
  const retailermail = location.state?.retailermail || "";

  // Get logged-in user
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const staffId = user?.id || null;

  console.log("Staff PlaceSalesOrder - Retailer Discount received:", retailerDiscount);
  console.log("Staff PlaceSalesOrder - Location state:", location.state);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch(`${baseurl}/categories`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map the API response to match your Category type
        const mappedCategories = data.map((category) => ({
          id: category.id.toString(),
          name: category.category_name,
          discount: category.discount,
          discountEndDate: category.discount_end_date,
          icon: getCategoryIcon(category.category_name),
        }));
        
        setCategoriesList(mappedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesList([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to assign icons based on category names
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Home Accessories': '🏠',
      'Snacks': '🍪',
      'Kitchen': '🔪',
      'Laptops': '💻',
      'Mobile': '📱',
      'Rice': '🍚',
      'Pulses': '🫘',
      'Oils': '🛢️',
      'Grains': '🌾',
      'Spices': '🌶️',
      'Sugar': '🧂',
      'Beverages': '☕',
    };
    
    return iconMap[categoryName] || '📦'; // Default icon
  };

  // Fetch cart items on load
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
            // Use retailerDiscount from props first, otherwise use from API
            const discountToUse = retailerDiscount > 0 ? retailerDiscount : (parseFloat(retailer.discount) || 0);
            setRetailerInfo({
              name: retailer.name,
              business: retailer.business_name,
              location: retailer.shipping_city,
              email: retailermail || retailer.email,
              discount: discountToUse,
            });
            console.log("Staff PlaceSalesOrder - Set retailerInfo discount to:", discountToUse);
          }
        }
      } catch (err) {
        console.error("Error fetching retailer info:", err);
        // Fallback to state data
        setRetailerInfo({
          name: customerName,
          email: retailermail,
          discount: retailerDiscount,
        });
        console.log("Staff PlaceSalesOrder - Fallback retailerInfo discount:", retailerDiscount);
      }
    };

    if (staffId) {
      fetchRetailerInfo();
    } else {
      // Fallback to state data
      setRetailerInfo({
        name: customerName,
        email: retailermail,
        discount: retailerDiscount,
      });
    }
  }, [retailerId, staffId, customerName, retailerDiscount, retailermail]);

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

  // Filter products based on search AND category
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      (product.category_id && product.category_id.toString() === selectedCategory) ||
      (product.category && product.category.toLowerCase() === categoriesList.find(cat => cat.id === selectedCategory)?.name?.toLowerCase());
    
    if (!searchTerm.trim()) return matchesCategory;
    
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.supplier?.toLowerCase().includes(query);
    
    return matchesCategory && matchesSearch;
  });

  // Add product to cart via backend
  const addToCart = async (product) => {
    try {
      // First check if product is already in cart
      const existingItem = cart.find(item => item.product_id === product.id);
      
      // Get logged-in user info
      const storedData = localStorage.getItem("user");
      const user = storedData ? JSON.parse(storedData) : null;
      
      // Format price to ensure it's a number
      const productPrice = parseFloat(product.price) || 0;
      
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
        // Add new item with price
        const requestBody = {
          customer_id: retailerId,
          product_id: product.id,
          quantity: 1,
          price: productPrice,  // Add the product price here
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add to cart");
        }
      }

      // Refresh cart from backend
      const cartResponse = await fetch(`${baseurl}/api/cart/customer-cart/${retailerId}`);
      const refreshedCart = await cartResponse.json();
      setCart(refreshedCart || []);

    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.message || "Failed to add item to cart");
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
                onClick={() => navigate("/staff/retailers")}
              >
                ← Back
              </button>
              <div className="staff-header-text">
                <h1>Place Sales Order</h1>
                {retailerInfo.name && (
                  <div>
                    <p className="staff-retailer-name">For: {retailerInfo.name}</p>
                    {retailerInfo.discount > 0 && (
                      <p className="staff-retailer-discount">Retailer Discount: {retailerInfo.discount}%</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Cart Button - Direct link to Cart Page */}
            <Link 
              to="/staff/cart" 
              state={{ 
                retailerId, 
                retailerDiscount: retailerDiscount, // Pass retailerDiscount here
                customerName: retailerInfo.name || customerName,
                retailermail: retailerInfo.email || retailermail
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

        {/* Category Slider */}
        <div className="category-slider-container">
          <div className="category-slider">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-chip ${
                selectedCategory === 'all'
                  ? 'category-chip-active'
                  : 'category-chip-inactive'
              }`}
            >
              All
            </button>
            
            {categoriesLoading ? (
              <div className="categories-loading">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="category-chip category-chip-loading"
                  >
                    <span className="invisible">Loading...</span>
                  </div>
                ))}
              </div>
            ) : (
              categoriesList.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-chip ${
                    selectedCategory === category.id
                      ? 'category-chip-active'
                      : 'category-chip-inactive'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))
            )}
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
          
          {/* Search Results Summary */}
          {searchTerm && (
            <div className="search-results-summary">
              <div className="search-summary-content">
                <p className="search-results-count">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'} for "{searchTerm}"
                </p>
                {filteredProducts.length === 0 && products.length > 0 && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="clear-search-btn"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="staff-order-content">
          
          {/* Products Section */}
          <div className="staff-products-section">
            <h2>
              Available Products ({filteredProducts.length})
              {selectedCategory !== 'all' && (
                <span className="category-filter-indicator">
                  in {categoriesList.find(cat => cat.id === selectedCategory)?.name || selectedCategory}
                </span>
              )}
            </h2>
            
            {loading && <p className="staff-loading">Loading products...</p>}
            {error && <p className="staff-error">{error}</p>}
            
            <div className="staff-products-grid">
              {!loading && filteredProducts.length === 0 && !error && (
                <div className="staff-no-products">
                  <p>No products found</p>
                  {searchTerm ? (
                    <p className="no-results-detail">
                      No results for "{searchTerm}" in {selectedCategory === 'all' ? 'all categories' : 'this category'}
                    </p>
                  ) : (
                    <p className="no-results-detail">Try selecting a different category</p>
                  )}
                  <div className="no-results-actions">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="action-btn primary-action"
                    >
                      View All Products
                    </button>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="action-btn secondary-action"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>
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
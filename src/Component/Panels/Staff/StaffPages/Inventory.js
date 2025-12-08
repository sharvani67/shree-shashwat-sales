import React, { useState } from "react";
import StaffMobileLayout from "../../Staff/StaffPages/StaffMobileLayout/StaffMobileLayout";
import "./StaffInventory.css";
import { Link } from "react-router-dom";

function StaffInventory() {
  const user = JSON.parse(localStorage.getItem("user"));
  const staffName = user?.name || "Staff Member";

  // Sample inventory data
  const inventoryData = [
    { id: 1, sNo: 1, categoryName: "Electronics", productName: "iPhone 15 Pro", stockAvailable: 24, unit: "pcs" },
    { id: 2, sNo: 2, categoryName: "Electronics", productName: "MacBook Air M2", stockAvailable: 12, unit: "pcs" },
    { id: 3, sNo: 3, categoryName: "Fashion", productName: "Men's Cotton T-Shirt", stockAvailable: 56, unit: "pcs" },
    { id: 4, sNo: 4, categoryName: "Home & Kitchen", productName: "Coffee Maker", stockAvailable: 8, unit: "pcs" },
    { id: 5, sNo: 5, categoryName: "Books", productName: "React Development Guide", stockAvailable: 0, unit: "pcs" },
    { id: 6, sNo: 6, categoryName: "Sports", productName: "Yoga Mat", stockAvailable: 15, unit: "pcs" },
    { id: 7, sNo: 7, categoryName: "Beauty", productName: "Face Cream", stockAvailable: 32, unit: "units" },
    { id: 8, sNo: 8, categoryName: "Electronics", productName: "Wireless Earbuds", stockAvailable: 45, unit: "pairs" },
    { id: 9, sNo: 9, categoryName: "Fashion", productName: "Women's Handbag", stockAvailable: 18, unit: "pcs" },
    { id: 10, sNo: 10, categoryName: "Home & Kitchen", productName: "Air Fryer", stockAvailable: 7, unit: "pcs" },
  ];

  const categories = ["All", "Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Beauty"];
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // Filter items based on category and search
  const filteredItems = inventoryData.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.categoryName === selectedCategory;
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // Get stock status
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Out of Stock", class: "stock-out" };
    if (stock < 10) return { text: "Low Stock", class: "stock-low" };
    return { text: "In Stock", class: "stock-ok" };
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  return (
    <StaffMobileLayout>
      <div className="staff-inventory-page">
        {/* Header Section - Matching Dashboard Style */}
        <header className="inventory-header">
          <h1>Inventory Management</h1>
          <p className="inventory-subtitle">Track and manage product stock</p>
        </header>


        <div className="inventory-stats-grid">
            <div className="inventory-stat-card">
              <div className="inventory-stat-icon">📦</div>
              <div className="inventory-stat-content">
                <h3>Total Products</h3>
                <div className="inventory-stat-value">{inventoryData.length}</div>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-icon">✅</div>
              <div className="inventory-stat-content">
                <h3>In Stock</h3>
                <div className="inventory-stat-value">
                  {inventoryData.filter(item => item.stockAvailable > 0).length}
                </div>
              </div>
            </div>

            <div className="inventory-stat-card">
              <div className="inventory-stat-icon">⚠️</div>
              <div className="inventory-stat-content">
                <h3>Low Stock</h3>
                <div className="inventory-stat-value">
                  {inventoryData.filter(item => item.stockAvailable < 10 && item.stockAvailable > 0).length}
                </div>
              </div>
            </div>
          </div>

        <div className="inventory-content">
          {/* Search and Filter Section */}
          <div className="inventory-controls">
            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="Search products..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>

            {/* <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div> */}
          </div>

          {/* Inventory Table */}
          <div className="inventory-table-wrapper">
            <div className="table-container">
              {/* Table Header */}
              <div className="table-header-row">
                <div className="table-header-cell inventory-sno">S.No</div>
                <div className="table-header-cell inventory-category">Category</div>
                <div className="table-header-cell inventory-product">Product Name</div>
                <div className="table-header-cell inventory-stock">Stock Available</div>
              </div>

              {/* Table Body */}
              <div className="table-body">
                {currentItems.length === 0 ? (
                  <div className="no-data-message">
                    <div className="no-data-icon">📦</div>
                    <p>No products found</p>
                    <p className="no-data-hint">Try changing your search or filter</p>
                  </div>
                ) : (
                  currentItems.map((item, index) => {
                    const stockStatus = getStockStatus(item.stockAvailable);
                    const displaySNo = indexOfFirstItem + index + 1;
                    return (
                      <div key={item.id} className={`table-row ${stockStatus.class}`}>
                        <div className="table-cell inventory-sno">{displaySNo}</div>
                        <div className="table-cell inventory-category">
                          <span className="category-badge">{item.categoryName}</span>
                        </div>
                        <div className="table-cell inventory-product">
                          <div className="product-info">
                            <div className="product-name">{item.productName}</div>
                          </div>
                        </div>
                        <div className="table-cell inventory-stock">
                          <div className="stock-info">
                            <div className="stock-quantity">{item.stockAvailable} {item.unit}</div>
                            <div className={`stock-status ${stockStatus.class}`}>
                              {stockStatus.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {filteredItems.length > entriesPerPage && (
                <div className="pagination-controls">
                  <button 
                    className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <div className="pagination-numbers">
                    {getPageNumbers().map(number => (
                      <button
                        key={number}
                        className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                        onClick={() => handlePageChange(number)}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffInventory;
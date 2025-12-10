import React, { useState, useEffect } from "react";
import StaffMobileLayout from "../../Staff/StaffPages/StaffMobileLayout/StaffMobileLayout";
import "./StaffInventory.css";

function StaffInventory() {
  const user = JSON.parse(localStorage.getItem("user"));
  const staffName = user?.name || "Staff Member";

  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  // Fetch inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch("http://localhost:5000/api/inventory");
        if (!res.ok) throw new Error("Failed to fetch inventory");

        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data.map((item, idx) => ({
            id: idx + 1,
            sNo: idx + 1,
            categoryName: item.category_name,
            productName: item.product_name,
            stockAvailable: item.available_quantity,
            unit: "pcs",
          }));
          setInventoryData(formatted);
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (err) {
        setError("Unable to load inventory. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filter
  const filteredItems = inventoryData.filter((item) => {
    return (
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Stock status
  const getStockStatus = (qty) => {
    if (qty === 0) return { text: "Out of Stock", class: "stock-out" };
    if (qty < 10) return { text: "Low Stock", class: "stock-low" };
    return { text: "In Stock", class: "stock-ok" };
  };

  return (
    <StaffMobileLayout>
      <div className="staff-inventory-page">
        <header className="inventory-header">
          <h1>Inventory Management</h1>
          <p className="inventory-subtitle">
            Monitor product availability & stock levels
          </p>
        </header>

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading inventory...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Inventory</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* Search */}
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
                  <button className="clear-search" onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="inventory-table-wrapper">
              <div className="table-container">
                {/* Header */}
                <div className="table-header-row">
                  <div className="table-header-cell">S.No</div>
                  <div className="table-header-cell">Category</div>
                  <div className="table-header-cell">Product Name</div>
                  <div className="table-header-cell">Stock</div>
                </div>

                <div className="table-body">
                  {currentItems.length === 0 ? (
                    <div className="no-data-message">
                      <div className="no-data-icon">📦</div>
                      <p>No matching products found.</p>
                    </div>
                  ) : (
                    currentItems.map((item, idx) => {
                      const status = getStockStatus(item.stockAvailable);

                      return (
                        <div key={item.id} className={`table-row ${status.class}`}>
                          <div className="table-cell">{indexOfFirst + idx + 1}</div>
                          <div className="table-cell">
                            <span className="category-badge">{item.categoryName}</span>
                          </div>
                          <div className="table-cell">
                            <div className="product-name">{item.productName}</div>
                          </div>
                          <div className="table-cell">
                            <div className="stock-info">
                              <span className="stock-quantity">
                                {item.stockAvailable} {item.unit}
                              </span>
                              <span className={`stock-status ${status.class}`}>
                                {status.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {filteredItems.length > entriesPerPage && (
                  <div className="pagination-controls">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      ← Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={`pagination-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </StaffMobileLayout>
  );
}

export default StaffInventory;

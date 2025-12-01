import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./MyRetailers.css";

function MyRetailers() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** -----------------------------
   *  Get logged-in user
   * ----------------------------- */
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;

  const staffId = user?.id || null;
  const role = user?.role || null;

  useEffect(() => {
    if (!staffId || role !== "staff") return;

    setLoading(true);
    setError(null);

    fetch(`${baseurl}/get-sales-retailers/${staffId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          setRetailers(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch retailers");
        }
      })
      .catch((err) => {
        console.error("Error fetching retailers:", err);
        setError("Failed to load retailers");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [staffId, role]);

  /** -----------------------------
   *  Search Filter
   * ----------------------------- */
  const filteredRetailers = retailers.filter((retailer) =>
    retailer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.shipping_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRetailer = () => navigate("/staff/add-retailer");

  const handlePlaceOrder = (retailerId,discount) => {
    navigate("/staff/place-sales-order", { 
      state: { retailerId,discount } 
    });
  };

  return (
    <StaffMobileLayout>
      <div className="my-retailers-mobile">

        {/* 🔹 Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1>My Retailers</h1>
              <p>Manage retailer relationships and track performance</p>
            </div>
            <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
              + Add Retailer
            </button>
          </div>
        </div>

        {/* 🔹 Search */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search retailers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* 🔹 Retailers Section */}
        <div className="retailers-section">

          <div className="section-header">
            <h2>Retailers ({filteredRetailers.length})</h2>
            <p>Track retailer performance and manage relationships</p>
          </div>

          {/* Loading */}
          {loading && <p className="loading-text">Loading retailers...</p>}

          {/* Error */}
          {error && <p className="error-text">{error}</p>}

          {/* List */}
          <div className="retailers-list">
            {!loading && filteredRetailers.length === 0 && (
              <p className="empty-text">No retailers found.</p>
            )}

            {filteredRetailers.map((retailer) => (
              <div key={retailer.id} className="retailer-card">

                <div className="retailer-header">
                  <h3>{retailer.name}</h3>
                  <button 
                    className="place-order-btn"
                    onClick={() => handlePlaceOrder(retailer.id,retailer.discount)}
                  >
                    Place Order
                  </button>
                </div>

                <div className="retailer-contact">
                  <div className="contact-phone">{retailer.mobile_number}</div>
                  <div className="contact-email">{retailer.email}</div>
                </div>

                <div className="retailer-extra">
                  <p><strong>Business:</strong> {retailer.business_name}</p>
                  <p><strong>Location:</strong> {retailer.shipping_city}</p>
                  <p><strong>Status:</strong> {retailer.status || "—"}</p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </StaffMobileLayout>
  );
}

export default MyRetailers;
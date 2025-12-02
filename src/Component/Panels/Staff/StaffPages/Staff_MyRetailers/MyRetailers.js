// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
// import { baseurl } from "../../../../BaseURL/BaseURL";
// import "./MyRetailers.css";

// function MyRetailers() {
//   const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [retailers, setRetailers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   /** -----------------------------
//    *  Get logged-in user
//    * ----------------------------- */
//   const storedData = localStorage.getItem("user");
//   const user = storedData ? JSON.parse(storedData) : null;

//   const staffId = user?.id || null;
//   const role = user?.role || null;

//   useEffect(() => {
//     if (!staffId || role !== "staff") return;

//     setLoading(true);
//     setError(null);

//     fetch(`${baseurl}/get-sales-retailers/${staffId}`)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//         return res.json();
//       })
//       .then((result) => {
//         if (result.success) {
//           setRetailers(result.data);
//         } else {
//           throw new Error(result.error || "Failed to fetch retailers");
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching retailers:", err);
//         setError("Failed to load retailers");
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [staffId, role]);

//   /** -----------------------------
//    *  Search Filter
//    * ----------------------------- */
//   const filteredRetailers = retailers.filter((retailer) =>
//     retailer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     retailer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     retailer.shipping_city?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleAddRetailer = () => navigate("/staff/add-retailer");

//   const handlePlaceOrder = (retailerId,discount) => {
//     navigate("/staff/place-sales-order", { 
//       state: { retailerId,discount } 
//     });
//   };

//   return (
//     <StaffMobileLayout>
//       <div className="my-retailers-mobile">

//         {/* 🔹 Header */}
//         <div className="page-header">
//           <div className="header-content">
//             <div className="header-text">
//               <h1>My Retailers</h1>
//               <p>Manage retailer relationships and track performance</p>
//             </div>
//             <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
//               + Add Retailer
//             </button>
//           </div>
//         </div>

//         {/* 🔹 Search */}
//         <div className="search-section">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search retailers..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//           </div>
//         </div>

//         {/* 🔹 Retailers Section */}
//         <div className="retailers-section">

//           <div className="section-header">
//             <h2>Retailers ({filteredRetailers.length})</h2>
//             <p>Track retailer performance and manage relationships</p>
//           </div>

//           {/* Loading */}
//           {loading && <p className="loading-text">Loading retailers...</p>}

//           {/* Error */}
//           {error && <p className="error-text">{error}</p>}

//           {/* List */}
//           <div className="retailers-list">
//             {!loading && filteredRetailers.length === 0 && (
//               <p className="empty-text">No retailers found.</p>
//             )}

//             {filteredRetailers.map((retailer) => (
//               <div key={retailer.id} className="retailer-card">

//                 <div className="retailer-header">
//                   <h3>{retailer.name}</h3>
//                   <button 
//                     className="place-order-btn"
//                     onClick={() => handlePlaceOrder(retailer.id,retailer.discount)}
//                   >
//                     Place Order
//                   </button>
//                 </div>

//                 <div className="retailer-contact">
//                   <div className="contact-phone">{retailer.mobile_number}</div>
//                   <div className="contact-email">{retailer.email}</div>
//                 </div>

//                 <div className="retailer-extra">
//                   <p><strong>Business:</strong> {retailer.business_name}</p>
//                   <p><strong>Location:</strong> {retailer.shipping_city}</p>
//                   <p><strong>Status:</strong> {retailer.status || "—"}</p>
//                 </div>

//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </StaffMobileLayout>
//   );
// }

// export default MyRetailers;



// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
// import { baseurl } from "../../../../BaseURL/BaseURL";
// import "./MyRetailers.css";

// function MyRetailers() {
//   const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [retailers, setRetailers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   /** -----------------------------
//    *  Get logged-in user
//    * ----------------------------- */
//   const storedData = localStorage.getItem("user");
//   const user = storedData ? JSON.parse(storedData) : null;

//   const staffId = user?.id || null;
//   const role = user?.role || null;

//   useEffect(() => {
//     if (!staffId || role !== "staff") return;

//     setLoading(true);
//     setError(null);

//     fetch(`${baseurl}/get-sales-retailers/${staffId}`)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//         return res.json();
//       })
//       .then((result) => {
//         if (result.success) {
//           setRetailers(result.data);
//         } else {
//           throw new Error(result.error || "Failed to fetch retailers");
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching retailers:", err);
//         setError("Failed to load retailers");
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [staffId, role]);

//   /** -----------------------------
//    *  Search Filter
//    * ----------------------------- */
//   const filteredRetailers = retailers.filter((retailer) =>
//     retailer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     retailer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     retailer.shipping_city?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleAddRetailer = () => navigate("/staff/add-retailer");

//   const handlePlaceOrder = (retailerId, discount) => {
//     navigate("/staff/place-sales-order", { 
//       state: { retailerId, discount } 
//     });
//   };

//   const handleViewDetails = (retailerId) => {
//     navigate(`/staff/view-retailers${retailerId}`);
//   };

//   return (
//     <StaffMobileLayout>
//       <div className="my-retailers-mobile">

//         {/* 🔹 Header */}
//         <div className="page-header">
//           <div className="header-content">
//             <div className="header-text">
//               <h1>My Retailers</h1>
//               <p>Manage retailer relationships and track performance</p>
//             </div>
//             <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
//               + Add Retailer
//             </button>
//           </div>
//         </div>

//         {/* 🔹 Search */}
//         <div className="search-section">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search retailers..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//           </div>
//         </div>

//         {/* 🔹 Retailers Section */}
//         <div className="retailers-section">

//           <div className="section-header">
//             <h2>Retailers ({filteredRetailers.length})</h2>
//             <p>Track retailer performance and manage relationships</p>
//           </div>

//           {/* Loading */}
//           {loading && <p className="loading-text">Loading retailers...</p>}

//           {/* Error */}
//           {error && <p className="error-text">{error}</p>}

//           {/* List */}
//           <div className="retailers-list">
//             {!loading && filteredRetailers.length === 0 && (
//               <p className="empty-text">No retailers found.</p>
//             )}

//             {filteredRetailers.map((retailer) => (
//               <div key={retailer.id} className="retailer-card">
                
//                 {/* Header Section */}
//                 <div className="retailer-header">
//                   <h3>{retailer.name}</h3>
//                   <div className="retailer-id">ID: {retailer.id || "—"}</div>
//                 </div>

//                 {/* Contact Section */}
//                 <div className="retailer-contact">
//                   <div className="contact-phone">{retailer.mobile_number || "No phone"}</div>
//                   <div className="contact-email">{retailer.email || "No email"}</div>
//                 </div>

//                 {/* Business Details */}
//                 <div className="retailer-extra">
//                   <p><strong>Business:</strong> {retailer.business_name || "—"}</p>
//                   <p><strong>Location:</strong> {retailer.shipping_city || "—"}</p>
//                   <div className="status-section">
//                     <div className="status-info">
//                       <p><strong>Status:</strong> {retailer.status || "Active"}</p>
//                     </div>
//                     <button 
//                       className="place-order-btn"
//                       onClick={() => handlePlaceOrder(retailer.id, retailer.discount)}
//                     >
//                       Place Order
//                     </button>
//                   </div>
//                 </div>

//                 {/* Footer with View Details Button */}
//                 <div className="retailer-footer">
//                   <button 
//                     className="view-details-btn"
//                     onClick={() => handleViewDetails(retailer.id)}
//                   >
//                     View Details
//                   </button>
//                 </div>

//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </StaffMobileLayout>
//   );
// }

// export default MyRetailers;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
// import { baseurl } from "../../../../BaseURL/BaseURL";
// import "./MyRetailers.css";

// function MyRetailers() {
//   const navigate = useNavigate();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [retailers, setRetailers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   /** -----------------------------
//    *  Get logged-in user
//    * ----------------------------- */
//   const storedData = localStorage.getItem("user");
//   const user = storedData ? JSON.parse(storedData) : null;

//   const staffId = user?.id || null;
//   const role = user?.role || null;

//   useEffect(() => {
//     if (!staffId || role !== "staff") return;

//     setLoading(true);
//     setError(null);

//     fetch(`${baseurl}/get-sales-retailers/${staffId}`)
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//         return res.json();
//       })
//       .then((result) => {
//         if (result.success) {
//           setRetailers(result.data);
//         } else {
//           throw new Error(result.error || "Failed to fetch retailers");
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching retailers:", err);
//         setError("Failed to load retailers");
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [staffId, role]);

//   /** -----------------------------
//    *  Search Filter
//    * ----------------------------- */
//   const filteredRetailers = retailers.filter((retailer) =>
//     retailer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     retailer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     retailer.shipping_city?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleAddRetailer = () => navigate("/staff/add-retailer");

//   const handlePlaceOrder = (retailerId, discount, retailerName) => {
//   navigate("/staff/place-sales-order", { 
//     state: { 
//       retailerId, 
//       discount,
//       customerName: retailerName 
//     } 
//   });
// };

//   const handleViewDetails = (retailerId) => {
//     navigate(`/staff/view-retailers/${retailerId}`);
//   };

//   return (
//     <StaffMobileLayout>
//       <div className="my-retailers-mobile">

//         {/* 🔹 Header */}
//         <div className="page-header1  new-style">
//           <div className="header-content">
//             <div className="header-text">
//               <h1>My Retailers</h1>
//               <p>Manage retailer relationships and track performance</p>
//             </div>
//             <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
//               + Add Retailer
//             </button>
//           </div>
//         </div>

//         {/* 🔹 Search */}
//         <div className="search-section">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search retailers..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="search-input"
//             />
//           </div>
//         </div>

//         {/* 🔹 Retailers Section */}
//         <div className="retailers-section">

//           <div className="section-header">
//             <h2>Retailers ({filteredRetailers.length})</h2>
//             <p>Track retailer performance and manage relationships</p>
//           </div>

//           {/* Loading */}
//           {loading && <p className="loading-text">Loading retailers...</p>}

//           {/* Error */}
//           {error && <p className="error-text">{error}</p>}

//           {/* List */}
//           <div className="retailers-list">
//             {!loading && filteredRetailers.length === 0 && (
//               <p className="empty-text">No retailers found.</p>
//             )}

//             {filteredRetailers.map((retailer) => (
//               <div key={retailer.id} className="retailer-card">
                
//                 {/* Header Section */}
//                 <div className="retailer-header">
//                   <div>
//                     <h3>{retailer.name}</h3>
//                     <div className="retailer-id">ID: {retailer.id || "—"}</div>
//                   </div>
//                 </div>

//                 {/* Contact Section */}
//                 <div className="retailer-contact">
//                   <div className="contact-phone">
//                     <span className="contact-icon">📱</span> {retailer.mobile_number || "No phone"}
//                   </div>
//                   <div className="contact-email">
//                     <span className="contact-icon">✉️</span> {retailer.email || "No email"}
//                   </div>
//                 </div>

//                 {/* Business Details */}
//                 <div className="retailer-extra">
//                   <div className="info-row">
//                     <span className="info-label">Business:</span>
//                     <span className="info-value">{retailer.business_name || "—"}</span>
//                   </div>
//                   <div className="info-row">
//                     <span className="info-label">Location:</span>
//                     <span className="info-value">{retailer.shipping_city || "—"}</span>
//                   </div>
//                   <div className="info-row">
//                     <span className="info-label">Status:</span>
//                     <span className="info-value">
//                       <span className={`status-badge ${(retailer.status || "active").toLowerCase()}`}>
//                         {retailer.status || "Active"}
//                       </span>
//                     </span>
//                   </div>
//                 </div>

//                 {/* Button Row - Both buttons in same row */}
//                 <div className="retailer-actions">
//                   <button 
//                     className="place-order-btn"
//                     onClick={() => handlePlaceOrder(retailer.id,retailer.discount, retailer.name)}
//                   >
//                     <span className="btn-icon">🛒</span> Place Order
//                   </button>
//                   <button 
//                     className="view-details-btn"
//                     onClick={() => handleViewDetails(retailer.id)}
//                   >
//                     <span className="btn-icon">👁️</span> View Details
//                   </button>
//                 </div>

//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </StaffMobileLayout>
//   );
// }

// export default MyRetailers;


//=================================================================

// code after the improvments 

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
  const [deletingId, setDeletingId] = useState(null);

  /** -----------------------------
   *  Get logged-in user
   * ----------------------------- */
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;

  const staffId = user?.id || null;
  const role = user?.role || null;

  // Fetch retailers function
  const fetchRetailers = () => {
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
  };

  useEffect(() => {
    fetchRetailers();
  }, [staffId, role]);

  /** -----------------------------
   *  Search Filter
   * ----------------------------- */
  const filteredRetailers = retailers.filter((retailer) =>
    retailer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retailer.shipping_city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** -----------------------------
   *  Handle Operations
   * ----------------------------- */
  const handleAddRetailer = () => navigate("/staff/add-retailer");

  const handleEditRetailer = (retailerId) => {
    navigate(`/staff/edit-retailer/${retailerId}`);
  };

  const handleDeleteRetailer = async (retailerId, retailerName) => {
    if (!window.confirm(`Are you sure you want to delete ${retailerName}?`)) {
      return;
    }

    try {
      setDeletingId(retailerId);
      
      const storedData = localStorage.getItem("user");
      const user = storedData ? JSON.parse(storedData) : null;
      const token = localStorage.getItem("token") || "";

      const response = await fetch(`${baseurl}/accounts/${retailerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        alert("Retailer deleted successfully!");
        // Refresh the retailers list
        fetchRetailers();
      } else {
        alert(result.error || "Failed to delete retailer");
      }
    } catch (err) {
      console.error("Error deleting retailer:", err);
      alert("Failed to delete retailer. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePlaceOrder = (retailerId, discount, retailerName) => {
    navigate("/staff/place-sales-order", { 
      state: { 
        retailerId, 
        discount,
        customerName: retailerName 
      } 
    });
  };

  const handleViewDetails = (retailerId) => {
    navigate(`/staff/view-retailers/${retailerId}`);
  };

  return (
    <StaffMobileLayout>
      <div className="my-retailers-container">

        {/* 🔹 Header */}
        <div className="my-retailers-header">
          <div className="my-retailers-header-content">
            <div className="my-retailers-header-text">
              <h1>My Retailers</h1>
              <p>Manage retailer relationships and track performance</p>
            </div>
            <button className="my-retailers-add-btn" onClick={handleAddRetailer}>
              + Add Retailer
            </button>
          </div>
        </div>

        {/* 🔹 Search */}
        <div className="my-retailers-search-section">
          <div className="my-retailers-search-bar">
            <input
              type="text"
              placeholder="Search retailers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="my-retailers-search-input"
            />
          </div>
        </div>

        {/* 🔹 Retailers Section */}
        <div className="my-retailers-list-section">

          <div className="my-retailers-section-header">
            <h2>Retailers ({filteredRetailers.length})</h2>
            <p>Track retailer performance and manage relationships</p>
          </div>

          {/* Loading */}
          {loading && <p className="my-retailers-loading">Loading retailers...</p>}

          {/* Error */}
          {error && <p className="my-retailers-error">{error}</p>}

          {/* List */}
          <div className="my-retailers-list">
            {!loading && filteredRetailers.length === 0 && (
              <p className="my-retailers-empty">No retailers found.</p>
            )}

            {filteredRetailers.map((retailer) => (
              <div key={retailer.id} className="my-retailer-card">
                
                {/* Header Section */}
                 <div className="my-retailer-card-header">
                  <div className="my-retailer-header-content">
                    <div className="my-retailer-header-text">
                      <h3>{retailer.name}</h3>
                      <div className="my-retailer-business">{retailer.business_name || "—"}</div>
                    </div>
                    <div className="my-retailer-action-icons">
                      <button 
                        className="icon-btn edit-retailer-btn"
                        onClick={() => handleEditRetailer(retailer.id)}
                        title="Edit Retailer"
                      >
                        ✏️
                      </button>
                      <button 
                        className="icon-btn delete-retailer-btn"
                        onClick={() => handleDeleteRetailer(retailer.id, retailer.name)}
                        disabled={deletingId === retailer.id}
                        title="Delete Retailer"
                      >
                        {deletingId === retailer.id ? "⏳" : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="my-retailer-contact">
                  <div className="my-retailer-phone">
                    <span className="my-retailer-contact-icon">📱</span> {retailer.mobile_number || "No phone"}
                  </div>
                  <div className="my-retailer-email">
                    <span className="my-retailer-contact-icon">✉️</span> {retailer.email || "No email"}
                  </div>
                 <div className="my-retailer-email">
  <span className="my-retailer-contact-icon">📍</span> {retailer.shipping_city || "No location"}
</div>

                </div>

                {/* Business Details */}
                {/* <div className="my-retailer-details">
                  <div className="my-retailer-detail-row">
                    <span className="my-retailer-detail-label">Location:</span>
                    <span className="my-retailer-detail-value">{retailer.shipping_city || "—"}</span>
                  </div>
                </div> */}

                {/* Button Row - Both buttons in same row */}
                <div className="my-retailer-actions">
                  <button 
                    className="my-retailer-order-btn"
                    onClick={() => handlePlaceOrder(retailer.id, retailer.discount, retailer.name)}
                  >
                    <span className="my-retailer-btn-icon">🛒</span> Place Order
                  </button>
                  <button 
                    className="my-retailer-details-btn"
                    onClick={() => handleViewDetails(retailer.id)}
                  >
                    <span className="my-retailer-btn-icon">👁️</span> View Details
                  </button>
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
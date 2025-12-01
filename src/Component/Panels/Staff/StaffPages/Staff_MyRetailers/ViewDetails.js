import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "../../../../BaseURL/BaseURL";
import "./ViewDetails.css";

function ViewRetailerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [retailer, setRetailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  useEffect(() => {
    const fetchRetailerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/accounts/${id}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setRetailer(data);
      } catch (err) {
        console.error("Error fetching retailer details:", err);
        setError("Failed to load retailer details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRetailerDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate("/staff/retailers");
  };

//   const handleEdit = () => {
//     navigate(`/staff/edit-retailer/${id}`);
//   };

//   const handlePlaceOrder = () => {
//     navigate("/staff/place-sales-order", { 
//       state: { retailerId: id, discount: retailer?.discount } 
//     });
//   };

  if (loading) {
    return (
      <StaffMobileLayout>
        <div className="view-retailer-details">
          <div className="loading-container">
            <p>Loading retailer details...</p>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  if (error || !retailer) {
    return (
      <StaffMobileLayout>
        <div className="view-retailer-details">
          <div className="error-container">
            <p>{error || "Retailer not found"}</p>
            <button onClick={handleBack} className="back-btn">Back to Retailers</button>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="view-retailer-details">
        
        {/* Header */}
        <div className="details-header">
          <div className="header-content">
            <button className="back-button" onClick={handleBack}>
              ← Back
            </button>
            <h1>Retailer Details</h1>
            {/* <div className="header-actions">
              <button className="edit-btn" onClick={handleEdit}>
                Edit
              </button>
              <button className="place-order-btn-header" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </div> */}
          </div>
          <div className="retailer-summary">
            <h2>{retailer.name}</h2>
            <p className="business-name">{retailer.business_name}</p>
            <div className="status-badge">
              {retailer.status || "Active"}
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="details-sections">
          
          {/* Personal Information */}
          <section className="details-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Title:</span>
                <span className="value">{retailer.title || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Name:</span>
                <span className="value">{retailer.name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Display Name:</span>
                <span className="value">{retailer.display_name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Entity Type:</span>
                <span className="value">{retailer.entity_type || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Mobile:</span>
                <span className="value">{retailer.mobile_number || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{retailer.email || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">{retailer.phone_number || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Fax:</span>
                <span className="value">{retailer.fax || "—"}</span>
              </div>
            </div>
          </section>

          {/* Business Information */}
          <section className="details-section">
            <h3>Business Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Business Name:</span>
                <span className="value">{retailer.business_name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Additional Business:</span>
                <span className="value">{retailer.additional_business_name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">GSTIN:</span>
                <span className="value">{retailer.gstin || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">GST Registered Name:</span>
                <span className="value">{retailer.gst_registered_name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Group Type:</span>
                <span className="value">{retailer.group || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Assigned Staff:</span>
                <span className="value">{retailer.assigned_staff || "—"}</span>
              </div>
            </div>
          </section>

          {/* Tax & Financial */}
          <section className="details-section">
            <h3>Tax & Financial Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">PAN:</span>
                <span className="value">{retailer.pan || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">TAN:</span>
                <span className="value">{retailer.tan || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">TCS Slab Rate:</span>
                <span className="value">{retailer.tds_slab_rate || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Currency:</span>
                <span className="value">{retailer.currency || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Payment Terms:</span>
                <span className="value">{retailer.terms_of_payment || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Reverse Charge:</span>
                <span className="value">{retailer.reverse_charge || "No"}</span>
              </div>
              <div className="info-item">
                <span className="label">Export/SEZ:</span>
                <span className="value">{retailer.export_sez || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Discount:</span>
                <span className="value">{retailer.discount ? `${retailer.discount}%` : "0%"}</span>
              </div>
            </div>
          </section>

          {/* Banking Details */}
          <section className="details-section">
            <h3>Banking Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Account Number:</span>
                <span className="value">{retailer.account_number || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Account Name:</span>
                <span className="value">{retailer.account_name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Bank Name:</span>
                <span className="value">{retailer.bank_name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Account Type:</span>
                <span className="value">{retailer.account_type || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">IFSC Code:</span>
                <span className="value">{retailer.ifsc_code || "—"}</span>
              </div>
              <div className="info-item">
                <span className="label">Branch Name:</span>
                <span className="value">{retailer.branch_name || "—"}</span>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="details-section">
            <h3>Shipping Address</h3>
            <div className="address-card">
              <p>{retailer.shipping_address_line1 || "—"}</p>
              <p>{retailer.shipping_address_line2 || "—"}</p>
              <div className="address-details">
                <span>{retailer.shipping_city || "—"}</span>
                <span>{retailer.shipping_state || "—"}</span>
                <span>{retailer.shipping_pin_code || "—"}</span>
              </div>
              <p><strong>Country:</strong> {retailer.shipping_country || "—"}</p>
              <p><strong>Branch:</strong> {retailer.shipping_branch_name || "—"}</p>
              <p><strong>GSTIN:</strong> {retailer.shipping_gstin || "—"}</p>
            </div>
          </section>

          {/* Billing Address */}
          <section className="details-section">
            <h3>Billing Address</h3>
            <div className="address-card">
              <p>{retailer.billing_address_line1 || "—"}</p>
              <p>{retailer.billing_address_line2 || "—"}</p>
              <div className="address-details">
                <span>{retailer.billing_city || "—"}</span>
                <span>{retailer.billing_state || "—"}</span>
                <span>{retailer.billing_pin_code || "—"}</span>
              </div>
              <p><strong>Country:</strong> {retailer.billing_country || "—"}</p>
              <p><strong>Branch:</strong> {retailer.billing_branch_name || "—"}</p>
              <p><strong>GSTIN:</strong> {retailer.billing_gstin || "—"}</p>
            </div>
          </section>

        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="secondary-btn" onClick={handleBack}>
            Back to List
          </button>
          {/* <button className="primary-btn" onClick={handlePlaceOrder}>
            Place New Order
          </button> */}
        </div>

      </div>
    </StaffMobileLayout>
  );
}

export default ViewRetailerDetails;
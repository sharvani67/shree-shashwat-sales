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

  if (loading) {
    return (
      <StaffMobileLayout>
        <div className="view-retailer-details">
          <div className="view-details-loading">
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
          <div className="view-details-error">
            <p>{error || "Retailer not found"}</p>
            <button onClick={handleBack} className="view-details-back-btn">Back to Retailers</button>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="view-retailer-details">
        
        {/* Header */}
        <div className="view-details-header">
          <button className="view-details-back" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="view-details-title">Retailer Details</h1>
        </div>

        {/* Retailer Summary Card */}
        <div className="view-details-summary-card">
          <div className="view-details-name-section">
            <h2 className="view-details-name">{retailer.name}</h2>
            <p className="view-details-business">{retailer.business_name}</p>
          </div>
          <div className={`view-details-status ${retailer.status?.toLowerCase() || 'active'}`}>
            {retailer.status || "Active"}
          </div>
        </div>

        {/* Details Sections */}
        <div className="view-details-sections">
          
          {/* Personal Information */}
          <section className="view-details-section">
            <h3 className="view-details-section-title">Personal Information</h3>
            <div className="view-details-grid">
              <div className="view-details-row">
                <span className="view-details-label">Title</span>
                <span className="view-details-value">{retailer.title || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Name</span>
                <span className="view-details-value">{retailer.name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Display Name</span>
                <span className="view-details-value">{retailer.display_name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Entity Type</span>
                <span className="view-details-value">{retailer.entity_type || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Mobile</span>
                <span className="view-details-value">{retailer.mobile_number || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Email</span>
                <span className="view-details-value">{retailer.email || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Phone</span>
                <span className="view-details-value">{retailer.phone_number || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Fax</span>
                <span className="view-details-value">{retailer.fax || "—"}</span>
              </div>
            </div>
          </section>

          {/* Business Information */}
          <section className="view-details-section">
            <h3 className="view-details-section-title">Business Information</h3>
            <div className="view-details-grid">
              <div className="view-details-row">
                <span className="view-details-label">Business Name</span>
                <span className="view-details-value">{retailer.business_name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Additional Business</span>
                <span className="view-details-value">{retailer.additional_business_name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">GSTIN</span>
                <span className="view-details-value">{retailer.gstin || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">GST Registered Name</span>
                <span className="view-details-value">{retailer.gst_registered_name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Group Type</span>
                <span className="view-details-value">{retailer.group || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Assigned Staff</span>
                <span className="view-details-value">{retailer.assigned_staff || "—"}</span>
              </div>
            </div>
          </section>

          {/* Tax & Financial */}
          <section className="view-details-section">
            <h3 className="view-details-section-title">Tax & Financial</h3>
            <div className="view-details-grid">
              <div className="view-details-row">
                <span className="view-details-label">PAN</span>
                <span className="view-details-value">{retailer.pan || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">TAN</span>
                <span className="view-details-value">{retailer.tan || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">TCS Slab Rate</span>
                <span className="view-details-value">{retailer.tds_slab_rate || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Currency</span>
                <span className="view-details-value">{retailer.currency || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Payment Terms</span>
                <span className="view-details-value">{retailer.terms_of_payment || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Reverse Charge</span>
                <span className="view-details-value">{retailer.reverse_charge || "No"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Export/SEZ</span>
                <span className="view-details-value">{retailer.export_sez || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Discount</span>
                <span className="view-details-value">{retailer.discount ? `${retailer.discount}%` : "0%"}</span>
              </div>
            </div>
          </section>

          {/* Banking Details */}
          <section className="view-details-section">
            <h3 className="view-details-section-title">Banking Details</h3>
            <div className="view-details-grid">
              <div className="view-details-row">
                <span className="view-details-label">Account Number</span>
                <span className="view-details-value">{retailer.account_number || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Account Name</span>
                <span className="view-details-value">{retailer.account_name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Bank Name</span>
                <span className="view-details-value">{retailer.bank_name || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Account Type</span>
                <span className="view-details-value">{retailer.account_type || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">IFSC Code</span>
                <span className="view-details-value">{retailer.ifsc_code || "—"}</span>
              </div>
              <div className="view-details-row">
                <span className="view-details-label">Branch Name</span>
                <span className="view-details-value">{retailer.branch_name || "—"}</span>
              </div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="view-details-section">
            <h3 className="view-details-section-title">Shipping Address</h3>
            <div className="view-details-address-card">
              <div className="view-details-address-row">
                <span className="view-details-address-label">Address Line 1</span>
                <span className="view-details-address-value">{retailer.shipping_address_line1 || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">Address Line 2</span>
                <span className="view-details-address-value">{retailer.shipping_address_line2 || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">City</span>
                <span className="view-details-address-value">{retailer.shipping_city || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">State</span>
                <span className="view-details-address-value">{retailer.shipping_state || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">PIN Code</span>
                <span className="view-details-address-value">{retailer.shipping_pin_code || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">Country</span>
                <span className="view-details-address-value">{retailer.shipping_country || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">Branch</span>
                <span className="view-details-address-value">{retailer.shipping_branch_name || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">GSTIN</span>
                <span className="view-details-address-value">{retailer.shipping_gstin || "—"}</span>
              </div>
            </div>
          </section>

          {/* Billing Address */}
          <section className="view-details-section">
            <h3 className="view-details-section-title">Billing Address</h3>
            <div className="view-details-address-card">
              <div className="view-details-address-row">
                <span className="view-details-address-label">Address Line 1</span>
                <span className="view-details-address-value">{retailer.billing_address_line1 || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">Address Line 2</span>
                <span className="view-details-address-value">{retailer.billing_address_line2 || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">City</span>
                <span className="view-details-address-value">{retailer.billing_city || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">State</span>
                <span className="view-details-address-value">{retailer.billing_state || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">PIN Code</span>
                <span className="view-details-address-value">{retailer.billing_pin_code || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">Country</span>
                <span className="view-details-address-value">{retailer.billing_country || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">Branch</span>
                <span className="view-details-address-value">{retailer.billing_branch_name || "—"}</span>
              </div>
              <div className="view-details-address-row">
                <span className="view-details-address-label">GSTIN</span>
                <span className="view-details-address-value">{retailer.billing_gstin || "—"}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Bottom Action Button */}
        {/* <div className="view-details-bottom-actions">
          <button className="view-details-bottom-btn" onClick={handleBack}>
            Back to Retailers List
          </button>
        </div> */}

      </div>
    </StaffMobileLayout>
  );
}

export default ViewRetailerDetails;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { FaUser, FaEnvelope, FaPhone, FaIdBadge, FaBuilding, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem("user");
    if (storedData) {
      try {
        const user = JSON.parse(storedData);
        setUserData(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    setLoading(false);
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <StaffMobileLayout>
        <div className="profile-page">
          <div className="loading-container">
            <p>Loading profile...</p>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  if (!userData) {
    return (
      <StaffMobileLayout>
        <div className="profile-page">
          <div className="error-container">
            <p>No profile data found</p>
            <button onClick={handleBack} className="back-btn">Go Back</button>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <StaffMobileLayout>
      <div className="profile-page">
        
        {/* Header */}
        <div className="profile-header-section">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>My Profile</h1>
          {/* <div className="header-actions">
            <span className="profile-role">Staff</span>
          </div> */}
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <FaUser className="avatar-icon" />
          </div>
          
          <div className="profile-basic-info">
            <h2>{userData.name || "Staff Member"}</h2>
            <p className="profile-email">{userData.email || "No email provided"}</p>
            <p className="profile-id">ID: {userData.id || "N/A"}</p>
          </div>
        </div>

        {/* Profile Details Sections */}
        <div className="profile-details-sections">
          
          {/* Contact Information */}
          <section className="details-section">
            <h3 className="section-title">
              <FaUser className="section-icon" /> Personal Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{userData.name || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">
                  <FaEnvelope className="value-icon" /> {userData.email || "—"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">
                  <FaPhone className="value-icon" /> {userData.phone_number || userData.mobile_number || "—"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className="info-value">
                  <FaIdBadge className="value-icon" /> {userData.role || "Staff"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">
                  <FaBuilding className="value-icon" /> {userData.department || "Sales"}
                </span>
              </div>
              {userData.joining_date && (
                <div className="info-item">
                  <span className="info-label">Joining Date</span>
                  <span className="info-value">
                    <FaCalendarAlt className="value-icon" /> {formatDate(userData.joining_date)}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Additional Information */}
          {/* <section className="details-section">
            <h3 className="section-title">
              <FaBuilding className="section-icon" /> Additional Information
            </h3>
            <div className="info-grid">
              {userData.employee_id && (
                <div className="info-item">
                  <span className="info-label">Employee ID</span>
                  <span className="info-value">{userData.employee_id}</span>
                </div>
              )}
              {userData.designation && (
                <div className="info-item">
                  <span className="info-label">Designation</span>
                  <span className="info-value">{userData.designation}</span>
                </div>
              )}
              {userData.address && (
                <div className="info-item full-width">
                  <span className="info-label">Address</span>
                  <span className="info-value">
                    <FaMapMarkerAlt className="value-icon" /> {userData.address}
                  </span>
                </div>
              )}
            </div>
          </section> */}

          {/* System Information */}
          {/* <section className="details-section">
            <h3 className="section-title">
              <FaIdBadge className="section-icon" /> System Information
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value">{userData.id || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Created</span>
                <span className="info-value">{formatDate(userData.created_at)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Login</span>
                <span className="info-value">{formatDate(userData.last_login)}</span>
              </div>
            </div>
          </section> */}

        </div>

      </div>
    </StaffMobileLayout>
  );
}

export default ProfilePage;
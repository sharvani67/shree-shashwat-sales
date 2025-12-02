import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { FaUser, FaEnvelope, FaPhone, FaIdBadge, FaBuilding, FaCalendarAlt } from "react-icons/fa";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    navigate(-1);
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
        <div className="profile-header-mobile">
          <button className="back-button-mobile" onClick={handleBack}>
            ← Back
          </button>
          <h1 className="profile-title">My Profile</h1>
        </div>

        {/* Profile Card */}
        {/* <div className="profile-card-mobile">
          <div className="profile-avatar-mobile">
            <FaUser className="avatar-icon-mobile" />
          </div>
          
          <div className="profile-info-mobile">
            <h2 className="profile-name">{userData.name || "Staff Member"}</h2>
            <p className="profile-email-mobile">
              <FaEnvelope className="icon-small" /> {userData.email || "No email provided"}
            </p>
            <p className="profile-id-mobile">
              <FaIdBadge className="icon-small" /> ID: {userData.id || "N/A"}
            </p>
          </div>
        </div> */}

        {/* Profile Details */}
        <div className="profile-sections-mobile">
          
          <section className="section-mobile">
            <h3 className="section-title-mobile">
              <FaUser className="section-icon-mobile" /> Personal Information
            </h3>
            <div className="info-list-mobile">
              <div className="info-row-mobile">
                <span className="info-label-mobile">Full Name</span>
                <span className="info-value-mobile">{userData.name || "—"}</span>
              </div>
              <div className="info-row-mobile">
                <span className="info-label-mobile">Email</span>
                <span className="info-value-mobile">
                  <FaEnvelope className="icon-inline" /> {userData.email || "—"}
                </span>
              </div>
              <div className="info-row-mobile">
                <span className="info-label-mobile">Phone</span>
                <span className="info-value-mobile">
                  <FaPhone className="icon-inline" /> {userData.phone_number || userData.mobile_number || "—"}
                </span>
              </div>
              <div className="info-row-mobile">
                <span className="info-label-mobile">Role</span>
                <span className="info-value-mobile">
                  <FaIdBadge className="icon-inline" /> {userData.role || "Staff"}
                </span>
              </div>
              <div className="info-row-mobile">
                <span className="info-label-mobile">Department</span>
                <span className="info-value-mobile">
                  <FaBuilding className="icon-inline" /> {userData.department || "Sales"}
                </span>
              </div>
              {userData.joining_date && (
                <div className="info-row-mobile">
                  <span className="info-label-mobile">Joining Date</span>
                  <span className="info-value-mobile">
                    <FaCalendarAlt className="icon-inline" /> {formatDate(userData.joining_date)}
                  </span>
                </div>
              )}
            </div>
          </section>

        </div>

      </div>
    </StaffMobileLayout>
  );
}

export default ProfilePage;
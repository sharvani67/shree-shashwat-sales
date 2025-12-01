import React from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./StaffProfile.css";

function StaffProfile() {
  const navigate = useNavigate();

  // Fetch staff user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");

    navigate("/");
  };

  return (
    <StaffMobileLayout>
      <div className="profile-m-container">
        
        <div className="profile-m-header">
          <h1>My Profile</h1>
          <p>Staff Information</p>
        </div>

        <div className="profile-m-card">
          <h2>{user?.name || "Staff Member"}</h2>

          <p><strong>ID:</strong> {user?.id}</p>

          <p><strong>Email:</strong> {user?.email || "Not Available"}</p>

          <p><strong>Mobile:</strong> {user?.mobile_number}</p>

          <p><strong>Role:</strong> {user?.role}</p>
        </div>

        <button className="profile-m-logout-btn" onClick={handleLogout}>
          Logout
        </button>
        <button
  className="profile-m-back-btn"
  onClick={() => navigate(-1)}
>
  Back
</button>


      </div>
    </StaffMobileLayout>
  );
}

export default StaffProfile;

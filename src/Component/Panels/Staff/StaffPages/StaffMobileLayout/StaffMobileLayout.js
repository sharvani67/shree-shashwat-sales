import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBullseye,
  FaClipboardList,
  FaChartLine,
  FaUser,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaUserCircle,
  FaChevronDown,
  FaShoppingBag
} from "react-icons/fa";
import "./StaffMobileLayout.css";

function StaffMobileLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userData, setUserData] = useState(null);

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
  }, []);

  const menuItems = [
    { path: "/staffdashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/staff/retailers", icon: <FaBullseye />, label: "Retailers" },
    { path: "/staff/sales-visits", icon: <FaClipboardList />, label: "Sales Visits" },
    // { path: "/staff/offers", icon: <FaUser />, label: "Offers" },
    // { path: "/staff/expences", icon: <FaChartLine />, label: "Expenses" },
    // { path: "/staff/offers", icon: <FaUser />, label: "Offers" },
    { path: "/staff/orders", icon: <FaShoppingBag />, label: "Orders" },
    { path: "/staff_expensive", icon: <FaMoneyBillWave />, label: "Expenses" },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate("/staff/profile");
  };

  const handleLogout = () => {
    // Clear staff-related localStorage items
    localStorage.removeItem("user");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    
    // Navigate to home page
    navigate("/");
    
    console.log("Staff logged out");
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.profile-menu-container')) {
      setShowProfileMenu(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProfileMenu]);

  return (
    <div className="staff-mobile-container">
      {/* Top Navigation Bar */}
      <header className="staff-top-nav">
        <div className="nav-logo">
          <h2>RetailPro</h2>
          <span>Staff Dashboard</span>
        </div>
        
        {/* Profile Menu */}
        <div className="profile-menu-container">
          <button 
            className="profile-btn" 
            onClick={toggleProfileMenu}
            aria-label="Profile menu"
          >
            <FaUserCircle className="profile-icon" />
            <FaChevronDown className={`chevron-icon ${showProfileMenu ? 'rotated' : ''}`} />
          </button>
          
          {showProfileMenu && (
            <div className="profile-dropdown">
              {/* Profile Header */}
              {/* <div className="profile-header">
                <FaUserCircle className="dropdown-profile-icon" />
                <div className="profile-info">
                  <h4>{userData?.name || "Staff User"}</h4>
                  <p>{userData?.email || "staff@example.com"}</p>
                  <span className="role-badge">Staff</span>
                </div>
              </div> */}
              
              <div className="dropdown-divider"></div>
              
              {/* Profile Details */}
              <button className="dropdown-item" onClick={handleProfileClick}>
                <FaUser className="dropdown-item-icon" />
                <span>View Profile</span>
              </button>
              
              <div className="dropdown-divider"></div>
              
              {/* Logout Button */}
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <FaSignOutAlt className="dropdown-item-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="staff-mobile-main">{children}</main>

      {/* Bottom Navigation */}
      <nav className="staff-bottom-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default StaffMobileLayout;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBullseye,
  FaClipboardList,
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

  // 🔥 Add relatedPaths here
  const menuItems = [
    {
      path: "/staffdashboard",
      relatedPaths: ["/staffdashboard"],
      icon: <FaTachometerAlt />,
      label: "Dashboard",
    },
    {
      path: "/staff/retailers",
      relatedPaths: ["/staff/retailers", "/staff/place-sales-order"," /staff/cart" ,"/staff/checkout" ,"/staff/view-retailers/"],
      icon: <FaBullseye />,
      label: "Retailers",
    },
    {
      path: "/staff/sales-visits",
      relatedPaths: ["/staff/log-visit" , " /staff/sales-visits"],
      icon: <FaClipboardList />,
      label: "Sales Visits",
    },
    {
      path: "/staff/orders",
      relatedPaths: [
        "/staff/orders",
        "/staff/order-details/"
        
      ],
      icon: <FaShoppingBag />,
      label: "Orders",
    },
    {
      path: "/staff_expensive",
      relatedPaths: ["/staff_add_expensive" , "/staff_expensive"],
      icon: <FaMoneyBillWave />,
      label: "Expenses",
    },
  ];

  // 🔥 Updated isActive to support related paths
  const isActive = (item) => {
    const current = location.pathname;

    // Exact or nested under main path
    if (current === item.path || current.startsWith(item.path + "/")) {
      return true;
    }

    // Check related paths
    if (item.relatedPaths && item.relatedPaths.some((p) => current.startsWith(p))) {
      return true;
    }

    return false;
  };

  const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    navigate("/staff/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".profile-menu-container")) {
      setShowProfileMenu(false);
    }
  };

  useEffect(() => {
    if (showProfileMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showProfileMenu]);

  return (
    <div className="staff-mobile-container">
      {/* Top Navigation */}
      <header className="staff-top-nav">
        <div className="nav-logo">
          <h2>RetailPro</h2>
          <span>Staff Dashboard</span>
        </div>

        {/* Profile Menu */}
        <div className="profile-menu-container">
          <button className="profile-btn" onClick={toggleProfileMenu}>
            <FaUserCircle className="profile-icon" />
            <FaChevronDown className={`chevron-icon ${showProfileMenu ? "rotated" : ""}`} />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-divider"></div>

              <button className="dropdown-item" onClick={handleProfileClick}>
                <FaUser className="dropdown-item-icon" />
                <span>View Profile</span>
              </button>

              <div className="dropdown-divider"></div>

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
            className={`nav-item ${isActive(item) ? "active" : ""}`}
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

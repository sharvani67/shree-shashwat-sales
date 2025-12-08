import React from "react";
import StaffMobileLayout from "../../Staff/StaffPages/StaffMobileLayout/StaffMobileLayout";
import "./StaffDashboard.css";
import { Link } from "react-router-dom";

function StaffDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const staffName = user?.name || "Staff Member";
  return (
    <StaffMobileLayout>
      <div className="staff-dashboard-mobile">
        {/* Header Section */}
        <header className="dashboard-header">
          <h1>Good morning, {staffName} <span className="emoji"></span></h1>
          <p>Here's your performance summary and today's tasks.</p>
        </header>

        <div className="dashboard-content">
          {/* Stats Grid Section */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>My Retailers</h3>
              <div className="stat-value">32</div>
              <div className="stat-change positive">+3 from last month</div>
            </div>

            <div className="stat-card">
              <h3>This Month Sales</h3>
              <div className="stat-value">¥2,45,890</div>
              <div className="stat-change positive">+15% from last month</div>
            </div>

            <div className="stat-card">
              <h3>Visits This Week</h3>
              <div className="stat-value">24</div>
              <div className="stat-change positive">+6 from last month</div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <p className="section-subtitle">Common tasks and shortcuts</p>

            <div className="action-cards">
              <Link to="/staff/log-visit" className="action-card">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h3>Log Sales Visit</h3>
                  <p>Record your latest retailer visit</p>
                </div>
              </Link>

              <Link to="/staff_add_expensive" className="action-card">
                <div className="action-icon">💰</div>
                <div className="action-content">
                  <h3>Submit Expense</h3>
                  <p>Add your daily expenses</p>
                </div>
              </Link>

              <Link to="/staff/add-retailer" className="action-card">
                <div className="action-icon">🏪</div>
                <div className="action-content">
                  <h3>Add Retailers</h3>
                  <p>Add Retailer details</p>
                </div>
              </Link>

              {/* INVENTORY BUTTON ADDED HERE */}
              <Link to="/staff/inventory" className="action-card">
                <div className="action-icon">📦</div>
                <div className="action-content">
                  <h3>Inventory</h3>
                  <p>Manage stock and products</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffDashboard;
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

            <div className="stat-card">
              <h3>Avg. Visit Score</h3>
              <div className="stat-value">8.2/10</div>
              <div className="stat-change positive">+0.5 from last month</div>
            </div>
          </div>

          {/* Recent Activity Section */}
          {/* <div className="recent-activity">
            <h2>Recent Activity</h2>
            <p className="section-subtitle">Latest updates from your network</p>
            
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-bullet"></div>
                <div className="activity-content">
                  <strong>New retailer onboarded</strong>
                  <p>Sharma Electronics - 2 hours ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-bullet"></div>
                <div className="activity-content">
                  <strong>Large order completed</strong>
                  <p>Pakka transaction ¥45,000 - 4 hours ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-bullet"></div>
                <div className="activity-content">
                  <strong>Flash sale started</strong>
                  <p>Electronics category - 6 hours ago</p>
                </div>
              </div>
            </div>
          </div> */}

         

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

  </div>
</div>

        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default StaffDashboard;
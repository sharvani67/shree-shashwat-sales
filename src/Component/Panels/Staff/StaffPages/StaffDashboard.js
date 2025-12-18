import React, { useState, useEffect } from "react";
import StaffMobileLayout from "../../Staff/StaffPages/StaffMobileLayout/StaffMobileLayout";
import SalespersonScores from "../../Staff/StaffPages/SalesPersonScore/SalesPersonScore"; // Add this import
import "./StaffDashboard.css";
import { Link } from "react-router-dom";
import { baseurl } from "../../../BaseURL/BaseURL";

function StaffDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const staffName = user?.name || "Staff Member";
  const staffId = user?.id || null;
  
  const [dashboardData, setDashboardData] = useState({
    retailerCount: 0,
    weeklyVisitsCount: 0,
    monthSales: 0,
    orderCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard counts
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!staffId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch retailer count
        const retailerResponse = await fetch(`${baseurl}/get-sales-retailers/${staffId}`);
        const retailerData = await retailerResponse.json();
        
        // Fetch sales visits for this week
        const visitsResponse = await fetch(`${baseurl}/api/salesvisits`);
        const visitsData = await visitsResponse.json();
        
        // Fetch orders count
        const ordersResponse = await fetch(`${baseurl}/orders/orders-placed-by/${staffId}`);
        const ordersData = await ordersResponse.json();
        
        // Calculate weekly visits count (last 7 days)
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        
        const weeklyVisits = (visitsData.data || []).filter(visit => {
          if (visit.staff_id !== staffId) return false;
          
          const visitDate = new Date(visit.created_at);
          return visitDate >= oneWeekAgo && visitDate <= today;
        });
        
        // Calculate monthly sales (current month)
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        const monthlySalesVisits = (visitsData.data || []).filter(visit => {
          if (visit.staff_id !== staffId) return false;
          
          const visitDate = new Date(visit.created_at);
          return visitDate.getMonth() === currentMonth && 
                 visitDate.getFullYear() === currentYear;
        });
        
        // Calculate total sales amount for the month
        const monthSalesTotal = monthlySalesVisits.reduce((total, visit) => {
          return total + (parseFloat(visit.sales_amount) || 0);
        }, 0);
        
        // Get retailer count
        const retailerCount = retailerData.success ? retailerData.data.length : 0;
        
        // Get order count
        const orderCount = Array.isArray(ordersData) ? ordersData.length : 0;
        
        setDashboardData({
          retailerCount,
          weeklyVisitsCount: weeklyVisits.length,
          monthSales: monthSalesTotal,
          orderCount
        });
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [staffId]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <StaffMobileLayout>
      <div className="staff-dashboard-mobile">
        {/* Header Section */}
        <header className="dashboard-header">
          <h1>Good morning, {staffName} <span className="emoji"></span></h1>
          <p>Here's your performance summary and today's tasks.</p>
        </header>

        <div className="dashboard-content">
          {loading && <div className="loading-spinner">Loading dashboard...</div>}
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Stats Grid Section */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>My Retailers</h3>
              <div className="stat-value">{dashboardData.retailerCount}</div>
              <Link to="/staff/retailers" className="stat-link">
                View all retailers →
              </Link>
            </div>

            <div className="stat-card">
              <h3>This Month Sales</h3>
              <div className="stat-value">{formatCurrency(dashboardData.monthSales)}</div>
              <Link to="/staff/sales-visits" className="stat-link">
                View sales details →
              </Link>
            </div>

            <div className="stat-card">
              <h3>Visits This Week</h3>
              <div className="stat-value">{dashboardData.weeklyVisitsCount}</div>
              <Link to="/staff/sales-visits" className="stat-link">
                View all visits →
              </Link>
            </div>
            
            <div className="stat-card">
              <h3>Total Orders</h3>
              <div className="stat-value">{dashboardData.orderCount}</div>
              <Link to="/staff/orders" className="stat-link">
                View all orders →
              </Link>
            </div>
          </div>

          {/* Add the SalespersonScores component here */}
          <SalespersonScores />

          {/* Quick Actions Section */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            {/* <p className="section-subtitle">Common tasks and shortcuts</p> */}

            <div className="action-cards">
              <Link to="/staff/pending-invoices" className="action-card">
                <div className="action-icon">🏷️</div>
                <div className="action-content">
                  <h3>Invoices</h3>
                  <p>View All Invoices</p>
                </div>
              </Link>
              
              <Link to="/staff/log-visit" className="action-card">
                <div className="action-icon">📊</div>
                <div className="action-content">
                  <h3>Log Sales Visit</h3>
                  <p>Record your latest retailer visit</p>
                </div>
              </Link>

              <Link to="/staff/add-retailer" className="action-card">
                <div className="action-icon">🏪</div>
                <div className="action-content">
                  <h3>Add Retailers</h3>
                  <p>Add Retailer details</p>
                </div>
              </Link>

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
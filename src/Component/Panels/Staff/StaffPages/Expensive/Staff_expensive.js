import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import axios from "axios";
import "./Staff_expensive.css";
import { baseurl } from "../../../../BaseURL/BaseURL";
import { FaEdit, FaTrash } from "react-icons/fa";

function Staff_expensive() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [retailersData, setRetailersData] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get logged-in user from localStorage
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  useEffect(() => {
    fetchExpensiveData();
  }, [userId, userName]);

  const fetchExpensiveData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/expensive`);
      // Filter by logged-in staff
      const filteredData = response.data.filter(
        (item) => item.staff_id === userId && item.staff_name === userName
      );
      setRetailersData(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter for search
  const filteredRetailers = retailersData.filter(
    (retailer) =>
      retailer.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRetailer = () => {
    navigate("/staff_add_expensive");
  };

  const handleEdit = (retailer) => {
    // Navigate to the same form with retailer data for editing
    navigate("/staff_add_expensive", { state: { retailer } });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        setIsDeleting(true);
        await axios.delete(`${baseurl}/expensive/${id}`);
        // Refresh the list after deletion
        fetchExpensiveData();
        alert("Expense deleted successfully!");
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Failed to delete expense. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <StaffMobileLayout>
      <div className="my-retailers-mobile">
        <div className="page-header1">
          <div className="header-content">
            <div className="header-text">
              <h1>Expenses</h1>
              <p>Manage your expenses</p>
            </div>
            <button className="add-retailer-btn-top" onClick={handleAddRetailer}>
              + Add Expense
            </button>
          </div>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search expenses by category, note, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="retailers-section">
          <div className="section-header">
            <h2>Expenses ({filteredRetailers.length})</h2>
            <p>Track and manage your expenses</p>
          </div>

          {loading ? (
            <div className="loading-message">Loading expenses...</div>
          ) : filteredRetailers.length === 0 ? (
            <div className="no-data-message">
              {searchTerm ? "No expenses found matching your search." : "No expenses found. Add your first expense!"}
            </div>
          ) : (
            <div className="retailers-list">
              {filteredRetailers.map((retailer) => (
                <div key={retailer.id} className="retailer-card">
                  <div className="retailer-header">
                    <h3>{retailer.category}</h3>
                    <div className="action-icons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEdit(retailer)}
                        title="Edit"
                        disabled={isDeleting}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(retailer.id)}
                        disabled={isDeleting}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <div className="retailer-contact">
                    <div className="contact-phone">Amount: ₹ {retailer.amount}</div>
                    <div className="contact-email">Date: {new Date(retailer.date).toLocaleDateString()}</div>
                  </div>

                  <div className="retailer-details">
                    <p>Note: {retailer.note || "No note"}</p>
                  </div>

                  <div className="retailer-status">
                    <span className={`status-badge ${retailer.status?.toLowerCase()}`}>
                      {retailer.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default Staff_expensive;
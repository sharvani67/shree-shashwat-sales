import React, { useState, useEffect } from "react";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./Staff_Add_expensive.css";
import { useNavigate, useLocation } from "react-router-dom";
import { baseurl } from "../../../../BaseURL/BaseURL";

const Staff_Add_expensive = () => {
  const location = useLocation();
  const isEditMode = location.state?.retailer ? true : false;
  const expenseId = location.state?.retailer?.id;
  
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    category: "",
    amount: "",
    date: "",
    note: "",
    staff_id: userId,
    staff_name: userName,
    status: "Pending",
  });

  // Fetch categories and expense data (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get(`${baseurl}/accounts`);
        const expenseCategories = categoriesResponse.data.filter(
          (item) => item.group && item.group.includes("Expenses")
        );
        setCategories(expenseCategories);

        // If editing, fetch expense data
        if (isEditMode && expenseId) {
          const expenseResponse = await axios.get(`${baseurl}/expensive/${expenseId}`);
          const expense = expenseResponse.data;
          
          // Find the category in the fetched categories
          const selectedCategory = expenseCategories.find(
            cat => cat.id === expense.category_id || cat.name === expense.category
          );
          
          setFormData({
            category_id: selectedCategory?.id || expense.category_id || "",
            category: selectedCategory?.name || expense.category || "",
            amount: expense.amount || "",
            date: expense.date ? expense.date.split('T')[0] : "",
            note: expense.note || "",
            staff_id: userId,
            staff_name: userName,
            status: expense.status || "Pending",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to load data. Please try again.");
      }
    };

    fetchData();
  }, [isEditMode, expenseId, userId, userName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If category dropdown changed, set both id and name
    if (name === "category_id") {
      const selectedCategory = categories.find((cat) => cat.id === parseInt(value));
      setFormData({
        ...formData,
        category_id: value,
        category: selectedCategory ? selectedCategory.name : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCancel = () => {
    navigate("/staff_expensive");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditMode && expenseId) {
        // Update existing expense
        const response = await axios.put(
          `${baseurl}/expensive/${expenseId}`,
          formData
        );
        console.log("Expense updated:", response.data);
        alert("Expense updated successfully!");
      } else {
        // Create new expense
        const response = await axios.post(`${baseurl}/expensive`, formData);
        console.log("Expense saved:", response.data);
        alert("Expense added successfully!");
      }
      
      navigate("/staff_expensive");
    } catch (error) {
      console.error("Error saving expense:", error.response?.data || error.message);
      alert(`Failed to save expense: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => isEditMode ? "Edit Expense" : "Add Expense";

  return (
    <StaffMobileLayout>
      <div className="staff_add_expense">
        <h1>{getTitle()}</h1>
        <p>{isEditMode ? "Edit expense details" : "Fill in the details to add an expense"}</p>
      </div>
      <div className="Staff_add_expense-container">
        <div className="Staff_add_expense-card">
          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {formData.category && formData.category_id === "" && (
                <small className="text-warning">
                  Note: Previously selected category "{formData.category}" is not in the list
                </small>
              )}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Note */}
            <div className="form-group">
              <label>Note</label>
              <textarea
                name="note"
                placeholder="Enter note"
                value={formData.note}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="staff_add_expensive-cancel-save">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn save-buttons"
                disabled={loading}
              >
                {loading ? "Saving..." : (isEditMode ? "Update Expense" : "Save Expense")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffMobileLayout>
  );
};

export default Staff_Add_expensive;
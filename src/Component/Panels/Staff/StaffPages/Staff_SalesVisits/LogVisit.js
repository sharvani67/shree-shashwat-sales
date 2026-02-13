import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import "./LogVisit.css";

function LogVisit() {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState([]);
  const [loadingRetailers, setLoadingRetailers] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  // Get today's date in YYYY-MM-DD format for default value
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    retailer_id: "",
    retailer_name: "",
    staff_id: userId,      // only from localStorage
    staff_name: userName,  // only from localStorage
    visitDate: getTodayDate(), // ADDED: Date field with today as default
    visitType: "",
    visitOutcome: "",
    salesAmount: "",
    transactionType: "",
    description: "",
    location: "",
    image: null,  
  });

  // Fetch retailers (only for dropdown)
  useEffect(() => {
    setLoadingRetailers(true);
    setError(null);

    fetch(`${baseurl}/api/retailers`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((result) => {
        if (result.success) {
          // Only store retailer_id and retailer_name
          const filtered = result.data.map((r) => ({
            retailer_id: r.retailer_id,
            retailer_name: r.retailer_name,
          }));
          setRetailers(filtered);
        } else {
          throw new Error(result.error || "Failed to fetch retailers");
        }
      })
      .catch((err) => {
        console.error("Error fetching retailers:", err);
        setError("Failed to load retailers. Please check your connection or try again.");
      })
      .finally(() => setLoadingRetailers(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "retailer_id") {
      const selected = retailers.find((r) => String(r.retailer_id) === String(value));
      setFormData((prev) => ({
        ...prev,
        retailer_id: value,
        retailer_name: selected ? selected.retailer_name : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call your backend endpoint instead of direct OpenStreetMap
          const response = await fetch(
            `${baseurl}/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.address) {
            setFormData(prev => ({
              ...prev,
              location: data.address
            }));
          } else {
            // Fallback to coordinates
            setFormData(prev => ({
              ...prev,
              location: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
            }));
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          // Alternative: Use a simpler method without external API
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationLoading(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("Location access denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            alert("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert("Please select an image file (JPG, PNG, GIF)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    const fileInput = document.getElementById("imageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData to handle file upload
    const formDataToSend = new FormData();
    
    // Append all form data
    formDataToSend.append('retailer_id', formData.retailer_id);
    formDataToSend.append('retailer_name', formData.retailer_name);
    formDataToSend.append('staff_id', userId);
    formDataToSend.append('staff_name', userName);
    formDataToSend.append('date', formData.visitDate); // CHANGED: from 'created_at' to 'date'
    formDataToSend.append('visit_type', formData.visitType);
    formDataToSend.append('visit_outcome', formData.visitOutcome);
    formDataToSend.append('sales_amount', formData.salesAmount 
      ? Number(String(formData.salesAmount).replace(/[^0-9.-]+/g, ""))
      : '');
    formDataToSend.append('transaction_type', formData.transactionType || '');
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('location', formData.location || '');
    
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const res = await fetch(`${baseurl}/api/salesvisits`, {
        method: "POST",
        body: formDataToSend,
      });
      
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/staff/sales-visits");
        }, 1500);
      }
      else {
        console.error("Failed to save visit:", data);
        alert(`Failed to save visit: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error saving visit:", err);
      alert("Server error while saving visit");
    }
  };

  const handleCancel = () => {
    navigate("/staff/sales-visits");
  };

  return (
    <StaffMobileLayout>
      {showSuccess && (
        <div className="success-popup">
          <div className="success-box">
            <img src="https://cdn-icons-png.flaticon.com/512/845/845646.png" alt="success" className="success-icon" />
            <p>Visit Logged Successfully!</p>
          </div>
        </div>
      )}
      
      <div className="log-visit-mobile">
        <header className="form-header1">
          <h1>Log Sales Visit</h1>
          <p>Record details of your retailer visit</p>
        </header>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="visit-form">
          {/* Retailer Dropdown */}
          <div className="form-group">
            <label htmlFor="retailer_id">Retailer Name *</label>
            <select
              id="retailer_id"
              name="retailer_id"
              value={formData.retailer_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select retailer</option>
              {loadingRetailers ? (
                <option value="" disabled>Loading...</option>
              ) : retailers.length === 0 ? (
                <option value="" disabled>No retailers available</option>
              ) : (
                retailers.map((r) => (
                  <option key={r.retailer_id} value={r.retailer_id}>
                    {r.retailer_name || "Unnamed Retailer"}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* DATE FIELD - ADDED HERE */}
          <div className="form-group">
            <label htmlFor="visitDate">Date *</label>
            <input
              type="date"
              id="visitDate"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              required
              className="date-input"
              max={getTodayDate()} // Optional: Prevents future dates
            />
          
          </div>

          {/* Visit Type */}
          <div className="form-group">
            <label htmlFor="visitType">Visit Type *</label>
            <select
              id="visitType"
              name="visitType"
              value={formData.visitType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select visit type</option>
              <option value="Routine">Routine</option>
              <option value="Follow Up">Follow Up</option>
              <option value="New Retailer">New Retailer</option>
              <option value="Issue Resolution">Issue Resolution</option>
            </select>
          </div>

          {/* Visit Outcome */}
          <div className="form-group">
            <label htmlFor="visitOutcome">Visit Outcome *</label>
            <select
              id="visitOutcome"
              name="visitOutcome"
              value={formData.visitOutcome}
              onChange={handleInputChange}
              required
            >
              <option value="">Select outcome</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>

          {/* Sales Amount */}
          <div className="form-group">
            <label htmlFor="salesAmount">Sales Amount</label>
            <input
              type="text"
              id="salesAmount"
              name="salesAmount"
              value={formData.salesAmount}
              onChange={handleInputChange}
              placeholder="Enter sales amount (e.g., 45000)"
            />
          </div>

          {/* Transaction Type */}
          <div className="form-group">
            <label htmlFor="transactionType">Transaction Type</label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.transactionType}
              onChange={handleInputChange}
            >
              <option value="">Select transaction type</option>
              <option value="Pakka">Pakka</option>
              <option value="Kaccha">Kaccha</option>
              <option value="Partial">Partial</option>
              <option value="Full">Full</option>
            </select>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="description">Notes</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional notes about the visit (optional)"
              rows="4"
            />
          </div>

          {/* Location Field */}
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <div className="location-input-wrapper">
              <textarea
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your current location will appear here"
                rows="3"
                className="location-input"
              />
              <button
                type="button"
                className="location-icon-btn"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                title="Get current location"
              >
                {locationLoading ? (
                  <span className="location-spinner"></span>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="location-hint">
              Click the location icon to auto-detect your location
            </p>
          </div>

          {/* Image Upload Field */}
          <div className="form-group">
            <label htmlFor="imageUpload">Visit Photo (Optional)</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                capture="environment"
              />
              <label htmlFor="imageUpload" className="upload-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Choose or Take Photo
              </label>
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            <p className="image-hint">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
          </div>

          {/* Buttons */}
          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="submit-btn log-btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </StaffMobileLayout>
  );
}

export default LogVisit;
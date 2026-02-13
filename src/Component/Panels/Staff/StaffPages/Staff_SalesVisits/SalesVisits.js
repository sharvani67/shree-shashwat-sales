import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { baseurl } from "./../../../../BaseURL/BaseURL";
import { FaMapMarkerAlt, FaTimes, FaSpinner } from "react-icons/fa";
import { MdImage } from "react-icons/md";
import "./SalesVisits.css";

function SalesVisits() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [salesVisitsData, setSalesVisitsData] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRetailers, setLoadingRetailers] = useState(false);
  const [error, setError] = useState(null);
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  
  // Image Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImageAlt, setModalImageAlt] = useState("");

  // Get logged-in user
  const storedData = localStorage.getItem("user");
  const user = storedData ? JSON.parse(storedData) : null;
  const staffId = user?.id || null;
  const role = user?.role || null;

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  // Format date from DD/MM/YYYY or ISO to YYYY-MM-DD for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // If it's already in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If it's in DD/MM/YYYY format
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error("Error parsing date:", e);
    }
    
    return "";
  };

  // Fetch Sales Visits
  useEffect(() => {
    if (!staffId) return;

    const fetchSalesVisits = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseurl}/api/salesvisits`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          const userVisits = (data.data || []).filter(
            (visit) => visit.staff_id === staffId
          );
          setSalesVisitsData(userVisits);
        } else {
          setError(data.error || "Failed to fetch sales visits");
        }
      } catch (err) {
        console.error("Error fetching sales visits:", err);
        setError("Server error while fetching sales visits");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesVisits();
  }, [staffId]);

  // Fetch Retailers for dropdown
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
        setError("Failed to load retailers. Please check your connection.");
      })
      .finally(() => setLoadingRetailers(false));
  }, []);

  const filteredSalesVisits = salesVisitsData.filter(
    (visit) =>
      (visit.retailer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (visit.id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.transaction_type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleLogVisit = () => navigate("/staff/log-visit");

  // Function to open image modal
  const openImageModal = (imageUrl, retailerName) => {
    setModalImageUrl(imageUrl);
    setModalImageAlt(`Visit image for ${retailerName || 'retailer'}`);
    setIsModalOpen(true);
  };

  // Function to close image modal
  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImageUrl("");
    setModalImageAlt("");
  };

  const handleEditVisit = (visit) => {
    setEditingVisitId(visit.id);
    setEditFormData({
      retailer_id: visit.retailer_id,
      retailer_name: visit.retailer_name,
      visit_date: visit.date, // ADDED: date field
      visit_outcome: visit.visit_outcome,
      sales_amount: visit.sales_amount,
      transaction_type: visit.transaction_type,
      visit_type: visit.visit_type,
      location: visit.location || "",
      description: visit.description || "",
      image_filename: visit.image_filename || "",
    });
    // Set image preview if exists
    if (visit.image_url) {
      setImagePreview(visit.image_url);
    }
    setImageFile(null);
    setIsImageRemoved(false);
  };

  // Function to get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Call backend endpoint for reverse geocoding
          const response = await fetch(
            `${baseurl}/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.address) {
            setEditFormData(prev => ({
              ...prev,
              location: data.address
            }));
          } else {
            // Fallback to coordinates
            setEditFormData(prev => ({
              ...prev,
              location: `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`
            }));
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          const { latitude, longitude } = position.coords;
          setEditFormData(prev => ({
            ...prev,
            location: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGettingLocation(false);
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

  // Handle image change for editing
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
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear the remove flag when new image is selected
      setEditFormData(prev => ({
        ...prev,
        image_filename: file.name
      }));
      setIsImageRemoved(false);
    }
  };

  // Remove image - FIXED for DB removal
  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    
    // Set image_filename to empty string to indicate removal
    setEditFormData(prev => ({
      ...prev,
      image_filename: "",
      image_url: null
    }));
    
    // IMPORTANT: Set the flag that image is removed
    setIsImageRemoved(true);
    
    const fileInput = document.getElementById(`imageUpload-${editingVisitId}`);
    if (fileInput) {
      fileInput.value = "";
    }
    
    console.log("Image removed flag set to true");
  };

  // Function to view location on map
  const handleViewLocation = (location) => {
    if (location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(mapsUrl, '_blank');
    } else {
      window.alert("No location data available");
    }
  };

  const handleUpdateVisit = async (visitId) => {
    if (window.confirm("Are you sure you want to update this sales visit?")) {
      try {
        const originalVisit = salesVisitsData.find((v) => v.id === visitId);
        
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Append all form data
        formDataToSend.append('retailer_id', editFormData.retailer_id);
        formDataToSend.append('retailer_name', editFormData.retailer_name);
        formDataToSend.append('staff_id', originalVisit.staff_id);
        formDataToSend.append('staff_name', originalVisit.staff_name);
        formDataToSend.append('visit_type', editFormData.visit_type);
        formDataToSend.append('visit_outcome', editFormData.visit_outcome);
        formDataToSend.append('sales_amount', editFormData.sales_amount || '');
        formDataToSend.append('transaction_type', editFormData.transaction_type || '');
        formDataToSend.append('description', editFormData.description || '');
        formDataToSend.append('location', editFormData.location || '');
        formDataToSend.append('date', editFormData.visit_date); // CHANGED: from created_at to date
        
        if (imageFile) {
          formDataToSend.append('image', imageFile);
        }
        
        // Add flag to indicate if image should be removed
        if (isImageRemoved || (editFormData.image_filename === "" && !imageFile && originalVisit?.image_url)) {
          formDataToSend.append('remove_image', 'true');
          formDataToSend.append('image_filename', '');
        }

        const res = await fetch(`${baseurl}/api/salesvisits/${visitId}`, {
          method: "PUT",
          body: formDataToSend,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.success) {
          const updatedVisit = {
            ...originalVisit,
            retailer_id: editFormData.retailer_id,
            retailer_name: editFormData.retailer_name,
            visit_type: editFormData.visit_type,
            visit_outcome: editFormData.visit_outcome,
            sales_amount: editFormData.sales_amount,
            transaction_type: editFormData.transaction_type,
            description: editFormData.description,
            location: editFormData.location,
            date: editFormData.visit_date, // CHANGED: update date field
            // If image was removed, set image_url to null
            image_url: isImageRemoved ? null : (data.data?.image_url || originalVisit.image_url),
            image_filename: isImageRemoved ? "" : (data.data?.image_filename || originalVisit.image_filename),
          };
          
          setSalesVisitsData((prev) =>
            prev.map((visit) => (visit.id === visitId ? updatedVisit : visit))
          );
          setEditingVisitId(null);
          setImageFile(null);
          setImagePreview(null);
          setIsImageRemoved(false);
          alert(`Sales visit for ${updatedVisit.retailer_name} updated successfully!`);
        } else {
          alert(data.error || "Failed to update sales visit");
        }
      } catch (err) {
        console.error("Error updating sales visit:", err);
        alert("Server error while updating sales visit");
      }
    }
  };

  const handleDeleteVisit = async (visit) => {
    if (window.confirm(`Are you sure you want to delete sales visit for ${visit.retailer_name}?`)) {
      try {
        const res = await fetch(`${baseurl}/api/salesvisits/${visit.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          setSalesVisitsData((prev) => prev.filter((v) => v.id !== visit.id));
          alert(`Sales visit for ${visit.retailer_name} deleted successfully!`);
        } else {
          alert(data.error || "Failed to delete sales visit");
        }
      } catch (err) {
        console.error("Error deleting sales visit:", err);
        alert("Server error while deleting sales visit");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <StaffMobileLayout>
        <div className="sales-visits-mobile">
          <p>Please log in to view sales visits.</p>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="sales-visits-mobile">
        <div className="page-header1">
          <div className="header-content">
            <div className="header-text">
              <h1>Sales Visits ({salesVisitsData.length})</h1>
              <p>Track your retailer visits and outcomes</p>
            </div>
            <button className="log-visit-btn" onClick={handleLogVisit}>
              + Log Visit
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-section">
          <input
            type="text"
            placeholder="Search visits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Sales Visits List */}
        <div className="sales-visits-list">
          {loading ? (
            <p>Loading sales visits...</p>
          ) : filteredSalesVisits.length === 0 ? (
            <p>No sales visits found.</p>
          ) : (
            filteredSalesVisits.map((visit, index) => (
              <div key={visit.id} className="visit-card">
                {editingVisitId === visit.id ? (
                  <div className="edit-form">
                    {/* Non-editable fields */}
                    <label>Visit ID</label>
                    <input type="text" value={visit.id} disabled className="edit-input" />
                    
                    <label>Staff Name</label>
                    <input type="text" value={visit.staff_name} disabled className="edit-input" />
                    
                    <label>Visit Date *</label>
                    <input
                      type="date"
                      name="visit_date"
                      value={editFormData.visit_date || formatDateForInput(visit.date)}
                      onChange={handleInputChange}
                      className="edit-input"
                      required
                    />
                    
                    <label>Retailer</label>
                    <select
                      name="retailer_id"
                      value={editFormData.retailer_id || visit.retailer_id}
                      onChange={(e) => {
                        const selectedRetailer = retailers.find(r => r.retailer_id === e.target.value);
                        setEditFormData(prev => ({
                          ...prev,
                          retailer_id: e.target.value,
                          retailer_name: selectedRetailer?.retailer_name || "",
                        }));
                      }}
                      className="edit-input"
                    >
                      <option value="">Select retailer</option>
                      {retailers.map(r => (
                        <option key={r.retailer_id} value={r.retailer_id}>{r.retailer_name}</option>
                      ))}
                    </select>

                    {/* Editable fields */}
                    <label>Visit Type</label>
                    <select
                      name="visit_type"
                      value={editFormData.visit_type || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="">Select visit type</option>
                      <option value="Routine">Routine</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="New Retailer">New Retailer</option>
                      <option value="Issue Resolution">Issue Resolution</option>
                    </select>

                    <label>Visit Outcome</label>
                    <select
                      name="visit_outcome"
                      value={editFormData.visit_outcome || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                    >
                      <option value="">Select outcome</option>
                      <option value="Successful">Successful</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>

                    <label>Sales Amount</label>
                    <input 
                      type="number" 
                      name="sales_amount" 
                      value={editFormData.sales_amount || ""} 
                      onChange={handleInputChange} 
                      className="edit-input" 
                      placeholder="Enter sales amount"
                    />

                    <label>Transaction Type</label>
                    <select 
                      name="transaction_type" 
                      value={editFormData.transaction_type || ""} 
                      onChange={handleInputChange} 
                      className="edit-input"
                    >
                      <option value="">Select transaction type</option>
                      <option value="Paikka">Paikka</option>
                      <option value="Kaccha">Kaccha</option>
                      <option value="Partial">Partial</option>
                      <option value="Full">Full</option>
                    </select>

                    {/* Location Field */}
                    <label>Location</label>
                    <div className="location-input-wrapper-mobile">
                      <input
                        type="text"
                        name="location"
                        value={editFormData.location || ""}
                        onChange={handleInputChange}
                        placeholder="Enter location"
                        className="edit-input location-input"
                        disabled={gettingLocation}
                      />
                      <button
                        type="button"
                        className="location-btn-mobile"
                        onClick={getCurrentLocation}
                        title="Get current location"
                        disabled={gettingLocation}
                      >
                        {gettingLocation ? <FaSpinner className="spinner-mobile" /> : <FaMapMarkerAlt />}
                      </button>
                    </div>

                    {/* Image Upload Field */}
                    <label>Update Image</label>
                    <div className="image-upload-container-mobile">
                      <input
                        type="file"
                        id={`imageUpload-${visit.id}`}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="image-input-mobile"
                      />
                      <label htmlFor={`imageUpload-${visit.id}`} className="upload-btn-mobile">
                        <MdImage />
                        {imageFile ? "Change Image" : "Choose Image"}
                      </label>
                      
                      {/* Current/Preview Image - Show only if image exists AND not removed */}
                      {!isImageRemoved && (imagePreview || visit.image_url) && (
                        <div className="image-preview-mobile">
                          <img 
                            src={imagePreview || visit.image_url} 
                            alt="Preview" 
                            className="preview-image-mobile"
                          />
                          <div className="image-actions-mobile">
                            <button
                              type="button"
                              className="view-image-btn-mobile"
                              onClick={() => openImageModal(imagePreview || visit.image_url, visit.retailer_name)}
                            >
                              <MdImage /> View
                            </button>
                            <button
                              type="button"
                              className="remove-image-btn-mobile"
                              onClick={removeImage}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Show message when image is removed */}
                      {isImageRemoved && (
                        <div className="image-preview-mobile" style={{ border: '2px dashed #fc8181', background: '#fff5f5' }}>
                          <p style={{ color: '#e53e3e', margin: '10px 0', textAlign: 'center' }}>
                            <strong>Image will be removed</strong>
                          </p>
                          <button
                            type="button"
                            className="upload-btn-mobile"
                            onClick={() => document.getElementById(`imageUpload-${visit.id}`).click()}
                            style={{ background: '#4299e1', marginBottom: '0' }}
                          >
                            <MdImage /> Upload New Image
                          </button>
                        </div>
                      )}
                      
                      <p className="image-hint-mobile">Max file size: 5MB. Click Remove to delete existing image</p>
                    </div>

                    {/* Description */}
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={editFormData.description || ""}
                      onChange={handleInputChange}
                      className="edit-input"
                      rows="3"
                      placeholder="Enter description"
                    />

                    <div className="edit-actions">
                      <button className="cancel-btn" onClick={() => {
                        setEditingVisitId(null);
                        setImageFile(null);
                        setImagePreview(null);
                        setIsImageRemoved(false);
                      }}>Cancel</button>
                      <button className="update-btn" onClick={() => handleUpdateVisit(visit.id)}>Update</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="visit-header">
                      <div className="visit-id">{index + 1}</div>  
                      <span className={`outcome-badge ${visit.visit_outcome?.toLowerCase()}`}>{visit.visit_outcome}</span>
                    </div>
                    <div className="visit-retailer">
                      <div className="retailer-name">{visit.retailer_name}</div>
                    </div>
                    <div className="visit-details">
                      <div className="detail-row">
                        <span className="detail-label">Date & Type:</span>
                        <span className="detail-value">
                        {visit.date ? formatDateForDisplay(visit.date) : ""} • {visit.visit_type}

                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Sales Amount:</span>
                        <span className="detail-value">₹{visit.sales_amount}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Transaction Type:</span>
                        <span className="detail-value">{visit.transaction_type}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Staff:</span>
                        <span className="detail-value">{visit.staff_name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Role:</span>
                        <span className="detail-value">{role}</span>
                      </div>
                      
                      {/* Location Display */}
                      {visit.location && (
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <div className="location-display-mobile">
                            <span className="location-text-mobile">
                              {visit.location.length > 20 ? `${visit.location.substring(0, 20)}...` : visit.location}
                            </span>
                            <button
                              className="location-view-btn-mobile"
                              onClick={() => handleViewLocation(visit.location)}
                              title="View on map"
                            >
                              <FaMapMarkerAlt />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Image Display - Using Modal instead of new tab */}
                      {visit.image_url && (
                        <div className="detail-row">
                          <span className="detail-label">Image:</span>
                          <div className="image-display-mobile">
                            <div 
                              className="image-thumbnail-mobile"
                              onClick={() => openImageModal(visit.image_url, visit.retailer_name)}
                              title="Click to view image"
                            >
                              <img 
                                src={visit.image_url} 
                                alt={`Visit for ${visit.retailer_name}`} 
                                className="thumbnail-image-mobile"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<span class="no-image-mobile">Image</span>';
                                }}
                              />
                              <div className="image-overlay-mobile">
                                <MdImage className="view-icon-mobile" />
                                <span className="view-text-mobile">View</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Description Display */}
                      {visit.description && (
                        <div className="detail-row description-row">
                          <span className="detail-label">Description:</span>
                          <span className="description-text">{visit.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="card-actions-mobile">
                      <button className="action-btn edit-btn-text" onClick={() => handleEditVisit(visit)}>
                        Edit
                      </button>
                      <button className="action-btn delete-btn-text" onClick={() => handleDeleteVisit(visit)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              <FaTimes />
            </button>
            <img 
              src={modalImageUrl} 
              alt={modalImageAlt} 
              className="image-modal-image"
            />
            <p className="image-modal-caption">{modalImageAlt}</p>
          </div>
        </div>
      )}
    </StaffMobileLayout>
  );
}

export default SalesVisits;
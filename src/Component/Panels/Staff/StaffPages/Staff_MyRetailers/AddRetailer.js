import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import "./AddRetailer.css";
import { baseurl } from "./../../../../BaseURL/BaseURL";

function AddRetailer({ mode = "add" }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [loading, setLoading] = useState(mode !== "add");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [isLoadingGstin, setIsLoadingGstin] = useState(false);
  const [gstinError, setGstinError] = useState(null);
  const [accountGroups, setAccountGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("information");
  const [errors, setErrors] = useState({});
  
  // Retrieve data from localStorage
  const storedData = localStorage.getItem("user");
  // Parse it back into an object
  const user = storedData ? JSON.parse(storedData) : null;
  // Get id and name separately
  const userId = user ? user.id : null;
  const userName = user ? user.name : null;

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    entity_type: "",
    group: "customer",
    role: "retailer",
    gstin: "",
    email: "",
    assigned_staff: userName,
    staffid: userId,
    business_name: "",
    display_name: "",
    gst_registered_name: "",
    additional_business_name: "",
    phone_number: "",
    fax: "",
    mobile_number: "",
    password: "",
    account_number: "",
    account_name: "",
    bank_name: "",
    account_type: "",
    ifsc_code: "",
    branch_name: "",
    pan: "",
    tan: "",
    tds_slab_rate: "",
    currency: "",
    terms_of_payment: "",
    reverse_charge: "",
    export_sez: "",
    shipping_address_line1: "",
    shipping_address_line2: "",
    shipping_city: "",
    shipping_pin_code: "",
     shipping_state_code: "",  // Add this
  billing_state_code: "",   // Add this
    shipping_state: "",
    shipping_country: "",
    shipping_branch_name: "",
    shipping_gstin: "",
    billing_address_line1: "",
    billing_address_line2: "",
    billing_city: "",
    billing_pin_code: "",
    billing_state: "",
    billing_country: "",
    billing_branch_name: "",
    billing_gstin: "",
  });

  // List of mandatory fields (same as in the retailer form)
  const mandatoryFields = [
    'name',
    'entity_type',
    'group',
    'gstin',
    'display_name',
    'shipping_state',
    'shipping_country',
    'billing_state',
    'billing_country'
  ];

  const tabs = [
    { id: "information", label: "Information" },
    { id: "banking", label: "Banking & Taxes" },
    { id: "shipping", label: "Shipping Address" },
    { id: "billing", label: "Billing Address" },
  ];

  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  // Helper function to get field label for error messages
  const getFieldLabel = (fieldName) => {
    const fieldLabels = {
      'name': 'Name',
      'entity_type': 'Entity Type',
      'group': 'Group Type',
      'email': 'Email',
      'display_name': 'Display Name',
      'phone_number': 'Phone Number',
      'mobile_number': 'Mobile Number',
      'gstin': 'GSTIN',
      'shipping_state': 'Shipping State',
      'shipping_country': 'Shipping Country',
      'billing_state': 'Billing State',
      'billing_country': 'Billing Country',
      'shipping_pin_code': 'Shipping PIN Code',
      'billing_pin_code': 'Billing PIN Code',
      'shipping_gstin': 'Shipping GSTIN',
      'billing_gstin': 'Billing GSTIN'
    };
    return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ');
  };

  useEffect(() => {
    // Fetch account groups dynamically
    const fetchAccountGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await axios.get(`${baseurl}/accountgroup`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setAccountGroups(
          response.data.map((group) => ({
            value: group.AccountsGroupName,
            label: group.AccountsGroupName,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch account groups:", err);
        if (err.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          // navigate("/login"); // Redirect to login
        }
        setAccountGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchAccountGroups();

    // Fetch retailer data for edit/view modes
    if (mode !== "add" && id) {
      const fetchRetailerData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${baseurl}/accounts/${id}`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
          const data = response.data;
          setFormData(data);
          const isSameAddress =
            data.billing_address_line1 === data.shipping_address_line1 &&
            data.billing_address_line2 === data.shipping_address_line2 &&
            data.billing_city === data.shipping_city &&
            data.billing_pin_code === data.shipping_pin_code &&
            data.billing_state === data.shipping_state &&
            data.billing_country === data.shipping_country &&
            data.billing_branch_name === data.shipping_branch_name &&
            data.billing_gstin === data.shipping_gstin;
          setSameAsShipping(isSameAddress);
        } catch (err) {
          console.error("Failed to fetch retailer data:", err);
          if (err.response?.status === 401) {
            alert("Unauthorized: Please log in again.");
            // navigate("/login");
          } else {
            alert("Failed to load retailer data");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchRetailerData();
    }
  }, [id, mode, navigate]);

  useEffect(() => {
    // Auto-generate password when name changes
    if (mode !== "view" && formData.name) {
      setFormData((prev) => ({ ...prev, password: `${formData.name}@123` }));
    }
  }, [formData.name, mode]);

  const handleGstinChange = async (e) => {
    if (mode === "view") return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "gstin" && value.length === 15) {
      try {
        setIsLoadingGstin(true);
        setGstinError(null);
        const response = await axios.post(
          `${baseurl}/gstin-details`,
          { gstin: value },
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        if (response.data.success && response.data.result) {
          const result = response.data.result;
          const addr = result.pradr?.addr || {};
          const addressLine1 = `${addr.bno || ""}${addr.bno && addr.flno ? ", " : ""}${addr.flno || ""}`.trim();
          const addressLine2 = `${addr.st || ""}${addr.st && addr.bnm ? ", " : ""}${addr.bnm || ""}${(addr.st || addr.bnm) && addr.loc ? ", " : ""
            }${addr.loc || ""}`.trim();
          setFormData((prev) => ({
            ...prev,
            gst_registered_name: result.lgnm || "",
            business_name: result.tradeNam || "",
            additional_business_name: result.tradeNam || "",
            display_name: result.lgnm || "",
            shipping_address_line1: addressLine1,
            shipping_address_line2: addressLine2,
            shipping_city: result.ctj || "",
            shipping_pin_code: addr.pncd || "",
            shipping_state: addr.stcd || "",
              shipping_state: addr.stcd || "", // State code from API
  shipping_state_code: addr.stcd || "", // Set state code
  billing_state: addr.stcd || "", // State code from API
  billing_state_code: addr.stcd || "", // Set state code
            shipping_country: "India",
            billing_address_line1: addressLine1,
            billing_address_line2: addressLine2,
            billing_city: result.ctj || "",
            billing_pin_code: addr.pncd || "",
            billing_state: addr.stcd || "",
            billing_country: "India",
          }));
          setSameAsShipping(true);
        }
      } catch (error) {
        setGstinError("Failed to fetch GSTIN details. Please enter manually.");
        console.error("Error fetching GSTIN details:", error);
        if (error.response?.status === 401) {
          alert("Unauthorized: Please log in again.");
          // navigate("/login");
        }
      } finally {
        setIsLoadingGstin(false);
      }
    }
  };

  const validateCurrentTab = () => {
    if (mode === "view") return true;
    const newErrors = {};
    
    switch (activeTab) {
      case "information":
        // Check mandatory fields for information tab
        const infoMandatoryFields = ['name', 'entity_type', 'group', 'display_name'];
        infoMandatoryFields.forEach(field => {
          if (!formData[field] || formData[field].toString().trim() === '') {
            newErrors[field] = 'This field is required';
          }
        });

        // Field-specific validations (only validate format if field has value)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }

        if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
          newErrors.mobile_number = 'Invalid mobile number (10 digits required)';
        }

        if (formData.phone_number && !/^[0-9]{10,15}$/.test(formData.phone_number)) {
          newErrors.phone_number = 'Invalid phone number (10-15 digits required)';
        }

        if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
          newErrors.gstin = 'Invalid GSTIN (15 characters required)';
        }
        break;

      case "banking":
        // No mandatory fields in banking tab
        // Only validate if field is filled (optional validation)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        break;

      case "shipping":
        // Only state and country are mandatory
        if (!formData.shipping_state) {
          newErrors.shipping_state = 'This field is required';
        }

        if (!formData.shipping_country) {
          newErrors.shipping_country = 'This field is required';
        }

        // Optional field validation if filled
        if (formData.shipping_pin_code && !/^[0-9]{6}$/.test(formData.shipping_pin_code)) {
          newErrors.shipping_pin_code = 'Invalid PIN code (6 digits required)';
        }

        if (formData.shipping_gstin && !/^[0-9A-Z]{0,15}$/.test(formData.shipping_gstin)) {
          newErrors.shipping_gstin = 'Invalid GSTIN (max 15 characters)';
        }
        break;

      case "billing":
        if (!sameAsShipping) {
          // Only state and country are mandatory
          if (!formData.billing_state) {
            newErrors.billing_state = 'This field is required';
          }

          if (!formData.billing_country) {
            newErrors.billing_country = 'This field is required';
          }

          // Optional field validation if filled
          if (formData.billing_pin_code && !/^[0-9]{6}$/.test(formData.billing_pin_code)) {
            newErrors.billing_pin_code = 'Invalid PIN code (6 digits required)';
          }

          if (formData.billing_gstin && !/^[0-9A-Z]{0,15}$/.test(formData.billing_gstin)) {
            newErrors.billing_gstin = 'Invalid GSTIN (max 15 characters)';
          }
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleInputChange = (e) => {
  if (mode === "view") return;
  const { name, value } = e.target;

  // Base update
  setFormData(prev => {
    let updated = { ...prev, [name]: value };

    // When user selects a shipping state by name, set its code
    if (name === 'shipping_state') {
      const st = getStateByName(value);
      // Note: Add shipping_state_code to your formData state if not already there
      updated.shipping_state_code = st ? st.code : "";
    }

    // When user selects a billing state by name, set its code
    if (name === 'billing_state') {
      const st = getStateByName(value);
      // Note: Add billing_state_code to your formData state if not already there
      updated.billing_state_code = st ? st.code : "";
    }

    return updated;
  });

  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }
};

  // Master list of Indian States & UTs with official GST-style codes
 const STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" }
];


const getStateByName = (name) =>
  STATES.find(s => s.name === name);

const getStateByCode = (code) =>
  STATES.find(s => s.code === code);


  const handleNext = () => {
    if (!validateCurrentTab()) {
      // Find the first error field and focus on it
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.focus();
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      // Show alert with specific missing fields
      const errorMessages = Object.keys(errors).map(field => {
        const fieldLabel = getFieldLabel(field);
        return `${fieldLabel}: ${errors[field]}`;
      }).join('\n');

      alert(`Please fix the following errors:\n\n${errorMessages}`);
      return;
    }

    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "view") {
      navigate("/staff/retailers");
      return;
    }

    // Validate all tabs before final submission
    let allTabsValid = true;
    const allErrors = {};

    // Check each tab's validation
    tabs.forEach(tab => {
      const tempErrors = {};

      if (tab.id === 'information') {
        // Base mandatory fields
        const informationMandatoryFields = ['name', 'entity_type', 'group', 'display_name'];

        // Validate all mandatory fields
        informationMandatoryFields.forEach(field => {
          if (!formData[field] || formData[field].toString().trim() === '') {
            tempErrors[field] = 'This field is required';
          }
        });

        // Field-specific validations
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          tempErrors.email = 'Invalid email format';
        }

        if (formData.mobile_number && !/^[0-9]{10}$/.test(formData.mobile_number)) {
          tempErrors.mobile_number = 'Invalid mobile number (10 digits required)';
        }

        if (formData.phone_number && !/^[0-9]{10,15}$/.test(formData.phone_number)) {
          tempErrors.phone_number = 'Invalid phone number (10-15 digits required)';
        }

        if (formData.gstin && !/^[0-9A-Z]{15}$/.test(formData.gstin)) {
          tempErrors.gstin = 'Invalid GSTIN (15 characters required)';
        }
      } else if (tab.id === 'shipping') {
        if (!formData.shipping_state) {
          tempErrors.shipping_state = 'This field is required';
        }

        if (!formData.shipping_country) {
          tempErrors.shipping_country = 'This field is required';
        }
      } else if (tab.id === 'billing' && !sameAsShipping) {
        if (!formData.billing_state) {
          tempErrors.billing_state = 'This field is required';
        }

        if (!formData.billing_country) {
          tempErrors.billing_country = 'This field is required';
        }
      }

      if (Object.keys(tempErrors).length > 0) {
        allTabsValid = false;
        Object.assign(allErrors, tempErrors);
      }
    });

    if (!allTabsValid) {
      setErrors(allErrors);
      alert('Please fill all required fields before submitting.');
      return;
    }

    let finalData = { ...formData };
    if (sameAsShipping) {
      finalData = {
        ...finalData,
        billing_address_line1: formData.shipping_address_line1,
        billing_address_line2: formData.shipping_address_line2,
        billing_city: formData.shipping_city,
        billing_pin_code: formData.shipping_pin_code,
        billing_state: formData.shipping_state,
        billing_country: formData.shipping_country,
        billing_branch_name: formData.shipping_branch_name,
        billing_gstin: formData.shipping_gstin,
      };
    }

    console.log("Submitting data:", finalData); // Debug payload
    try {
      if (mode === "edit") {
        await axios.put(`${baseurl}/accounts/${id}`, finalData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        alert("Retailer updated successfully!");
      } else {
        await axios.post(`${baseurl}/accounts`, finalData, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        alert("Retailer added successfully!");
      }
      navigate("/staff/retailers");
    } catch (err) {
      console.error("Failed to submit retailer data:", err);
      if (err.response?.status === 401) {
        alert("Unauthorized: Please log in again.");
        // navigate("/login");
      } else if (err.response?.status === 400) {
        alert(`Failed to ${mode === "edit" ? "update" : "add"} retailer: Invalid data provided.`);
      } else {
        alert(`Failed to ${mode === "edit" ? "update" : "add"} retailer`);
      }
    }
  };

  const handleCancel = () => {
    navigate("/staff/retailers");
  };

  const renderField = ({ type = "text", name, label, required = false, options = [], onChange }) => {
    // Check if field is mandatory based on our rules
    const isFieldMandatory = mandatoryFields.includes(name);
    
    if (mode === "view") {
      return (
        <div className="form-group">
          <label htmlFor={name}>{label}</label>
          <div className="view-mode-value">{formData[name] || "N/A"}</div>
        </div>
      );
    }
    
    if (type === "select") {
      return (
        <div className="form-group">
          <label htmlFor={name}>{label}{isFieldMandatory && '*'}</label>
          <select
            id={name}
            name={name}
            value={formData[name]}
            onChange={onChange || handleInputChange}
            required={isFieldMandatory}
            disabled={loadingGroups && name === "group"}
            className={errors[name] ? "is-invalid" : ""}
          >
            <option value="">Select</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
        </div>
      );
    }
    
    return (
      <div className="form-group">
        <label htmlFor={name}>{label}{isFieldMandatory && '*'}</label>
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={onChange || handleInputChange}
          placeholder={`Enter ${label.toLowerCase()}`}
          required={isFieldMandatory}
          maxLength={type === "text" && name.includes("gstin") ? 15 : undefined}
          disabled={name === "password"}
          className={errors[name] ? "is-invalid" : ""}
        />
        {errors[name] && <div className="invalid-feedback">{errors[name]}</div>}
      </div>
    );
  };

  // Update the title function
  const getTitle = () => {
    if (mode === "edit") return "Edit Retailer";
    if (mode === "view") return "View Retailer";
    return "Add New Retailer";
  };

  const renderActiveTab = () => {
    if (loading || loadingGroups) {
      return <div className="loading-spinner">Loading...</div>;
    }

    switch (activeTab) {
      case "information":
        return (
          <div className="form-section">
            <h2 className="section-title">Information</h2>
            {renderField({
              type: "select",
              name: "title",
              label: "Title",
              options: [
                { value: "Mr.", label: "Mr." },
                { value: "Mrs.", label: "Mrs." },
                { value: "Ms.", label: "Ms." },
                { value: "Dr.", label: "Dr." },
              ],
            })}
            {renderField({ name: "name", label: "Name", required: true })}
            {renderField({
              type: "select",
              name: "entity_type",
              label: "Entity Type",
              required: true,
              options: [
                { value: "Individual", label: "Individual" },
                { value: "Company", label: "Company" },
                { value: "Partnership", label: "Partnership" },
              ],
            })}
            {renderField({
              type: "select",
              name: "group",
              label: "Group Type",
              required: true,
              options: accountGroups,
            })}
            {renderField({
              name: "gstin",
              label: "Customer GSTIN",
              required: false,
              onChange: handleGstinChange,
            })}
            {isLoadingGstin && <div className="text-muted small">Fetching GSTIN details...</div>}
            {gstinError && <div className="text-danger small">{gstinError}</div>}
            {renderField({ type: "email", name: "email", label: "Email Address", required: false })}
            {renderField({ name: "business_name", label: "Business Name", required: false })}
            {renderField({ name: "display_name", label: "Display Name", required: true })}
            {renderField({ name: "gst_registered_name", label: "Customer GST Registered Name", required: false })}
            {renderField({ name: "additional_business_name", label: "Additional Business Name", required: false })}
            {renderField({ type: "tel", name: "phone_number", label: "Phone Number", required: false })}
            {renderField({ name: "fax", label: "Fax", required: false })}
            {renderField({ type: "tel", name: "mobile_number", label: "Mobile Number", required: false })}
            {renderField({ name: "password", label: "Password", required: false })}
            <div className="form-buttons">
              <div className="mobile-button-row">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" className="submit-btn bank-button" onClick={handleNext}>
                  Banking & Taxes
                </button>
              </div>
            </div>
          </div>
        );
      case "banking":
        return (
          <div className="form-section">
            <h2 className="section-title">Banking & Taxes</h2>
            <div className="form-subsection">
              <h3 className="subsection-title">Account Information</h3>
              {renderField({ name: "account_number", label: "Account Number", required: false })}
              {renderField({ name: "account_name", label: "Account Name", required: false })}
              {renderField({
                type: "select",
                name: "bank_name",
                label: "Bank Name",
                required: false,
                options: [
                  { value: "SBI", label: "SBI" },
                  { value: "HDFC", label: "HDFC" },
                  { value: "ICICI", label: "ICICI" },
                  { value: "Axis Bank", label: "Axis Bank" },
                ],
              })}
              {renderField({ name: "ifsc_code", label: "IFSC Code", required: false })}
              {renderField({
                type: "select",
                name: "account_type",
                label: "Account Type",
                required: false,
                options: [
                  { value: "Savings Account", label: "Savings Account" },
                  { value: "Current Account", label: "Current Account" },
                ],
              })}
              {renderField({ name: "branch_name", label: "Branch Name", required: false })}
            </div>
            <div className="form-subsection">
              <h3 className="subsection-title">Tax Information</h3>
              {renderField({ name: "pan", label: "PAN", required: false })}
              {renderField({ name: "tan", label: "TAN", required: false })}
              {renderField({
                type: "select",
                name: "tds_slab_rate",
                label: "TCS Slab Rate",
                required: false,
                options: [
                  { value: "Not Applicable", label: "TCS Not Applicable" },
                  { value: "0.1%", label: "0.1%" },
                  { value: "1%", label: "1%" },
                  { value: "5%", label: "5%" },
                ],
              })}
              {renderField({
                type: "select",
                name: "currency",
                label: "Currency",
                required: false,
                options: [
                  { value: "INR", label: "INR" },
                  { value: "USD", label: "US Dollar" },
                  { value: "EUR", label: "Euro" },
                ],
              })}
              {renderField({
                type: "select",
                name: "terms_of_payment",
                label: "Terms of Payment",
                required: false,
                options: [
                  { value: "Net 15", label: "Net 15" },
                  { value: "Net 30", label: "Net 30" },
                  { value: "Net 60", label: "Net 60" },
                ],
              })}
              {renderField({
                type: "select",
                name: "reverse_charge",
                label: "Apply Reverse Charge",
                required: false,
                options: [
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ],
              })}
              {renderField({
                type: "select",
                name: "export_sez",
                label: "Export or SEZ Developer",
                required: false,
                options: [
                  { value: "Not Applicable", label: "Not Applicable" },
                  { value: "Export", label: "Export" },
                  { value: "SEZ Developer", label: "SEZ Developer" },
                ],
              })}
            </div>
            <div className="form-buttons">
              <div className="mobile-button-row">
                <button type="button" className="cancel-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="button" className="submit-btn bank-button" onClick={handleNext}>
                  Next: Shipping Address
                </button>
              </div>
            </div>
          </div>
        );
     case "shipping":
  return (
    <div className="form-section">
      <h2 className="section-title">Shipping Address</h2>
      {renderField({ name: "shipping_address_line1", label: "Address Line 1", required: false })}
      {renderField({ name: "shipping_address_line2", label: "Address Line 2", required: false })}
      {renderField({ name: "shipping_city", label: "City", required: false })}
      {renderField({ name: "shipping_pin_code", label: "Pin Code", required: false })}
      
      <div className="row">
        <div className="col-md-6">
          {renderField({
            type: "select",
            name: "shipping_state",
            label: "State",
            required: true,
            options: STATES.map(s => ({ value: s.name, label: s.name }))
          })}
        </div>
        <div className="col-md-6">
          {renderField({
            type: "select",
            name: "shipping_state_code",
            label: "State Code",
            required: true,
            options: STATES.map(s => ({ value: s.code, label: s.code }))
          })}
        </div>
      </div>
      
      {renderField({
        type: "select",
        name: "shipping_country",
        label: "Country",
        required: true,
        options: [
          { value: "India", label: "India" },
          { value: "Bangladesh", label: "Bangladesh" },
          { value: "Canada", label: "Canada" },
          { value: "Iraq", label: "Iraq" },
        ],
      })}
      {renderField({ name: "shipping_branch_name", label: "Branch Name", required: false })}
      {renderField({ name: "shipping_gstin", label: "GSTIN", required: false })}
      
      <div className="form-buttons">
        <div className="mobile-button-row">
          <button type="button" className="cancel-btn" onClick={handleBack}>
            Back
          </button>
          <button type="button" className="submit-btn bank-button" onClick={handleNext}>
            Next: Billing Address
          </button>
        </div>
      </div>
    </div>
  );
      case "billing":
  return (
    <div className="form-section">
      <h2 className="section-title">Billing Address</h2>
      {mode !== "view" && (
        <div className="form-group">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="sameAsShipping"
              checked={sameAsShipping}
              onChange={(e) => setSameAsShipping(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="sameAsShipping">
              Shipping address is same as billing address
            </label>
          </div>
        </div>
      )}
      {(!sameAsShipping || mode === "view") && (
        <>
          {renderField({ name: "billing_address_line1", label: "Address Line 1", required: false })}
          {renderField({ name: "billing_address_line2", label: "Address Line 2", required: false })}
          {renderField({ name: "billing_city", label: "City", required: false })}
          {renderField({ name: "billing_pin_code", label: "Pin Code", required: false })}
          
          <div className="row">
            <div className="col-md-6">
              {renderField({
                type: "select",
                name: "billing_state",
                label: "State",
                required: true,
                options: STATES.map(s => ({ value: s.name, label: s.name }))
              })}
            </div>
            <div className="col-md-6">
              {renderField({
                type: "select",
                name: "billing_state_code",
                label: "State Code",
                required: true,
                options: STATES.map(s => ({ value: s.code, label: s.code }))
              })}
            </div>
          </div>
          
          {renderField({
            type: "select",
            name: "billing_country",
            label: "Country",
            required: true,
            options: [
              { value: "India", label: "India" },
              { value: "Bangladesh", label: "Bangladesh" },
              { value: "Canada", label: "Canada" },
              { value: "Iraq", label: "Iraq" },
            ],
          })}
          {renderField({ name: "billing_branch_name", label: "Branch Name", required: false })}
          {renderField({ name: "billing_gstin", label: "GSTIN", required: false })}
        </>
      )}
      
      <div className="form-buttons">
        <div className="mobile-button-row">
          <button type="button" className="cancel-btn" onClick={handleBack}>
            Back
          </button>
          <button type="submit" className="submit-btn bank-button">
            {mode === "edit" ? "Update Retailer" : "Add Retailer"}
          </button>
        </div>
      </div>
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <StaffMobileLayout>
      <div className="add-retailer-mobile">
        <header className="form-header1">
          <h2>{getTitle()}</h2>
          <p>Fill in the details to add a retailer to your network</p>
        </header>
        <form onSubmit={handleSubmit} className="retailer-form">
          {renderActiveTab()}
        </form>
      </div>
    </StaffMobileLayout>
  );
}

export default AddRetailer;
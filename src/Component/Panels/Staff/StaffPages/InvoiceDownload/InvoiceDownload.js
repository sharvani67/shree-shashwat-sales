import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import StaffMobileLayout from "../StaffMobileLayout/StaffMobileLayout";
import { 
  Download, 
  FileText, 
  ArrowLeft, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "react-toastify";
import "./InvoiceDownload.css";
import { baseurl } from "../../../../BaseURL/BaseURL";

function InvoiceDownload() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderNumber = searchParams.get("orderNumber");
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const [invoiceCounts, setInvoiceCounts] = useState({});

  useEffect(() => {
    if (!orderNumber) {
      navigate("/staff/orders");
      return;
    }
    fetchInvoices();
  }, [orderNumber, navigate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${baseurl}/transactions/download-pdf?order_number=${orderNumber}`
      );

      if (response.data.success) {
        setInvoices(response.data.pdfs || []);
        
        // Store invoice counts by order number
        setInvoiceCounts(prev => ({
          ...prev,
          [orderNumber]: response.data.count
        }));
      } else {
        setError(response.data.message || "Failed to load invoices");
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.response?.data?.message || "Failed to load invoices");
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoice, index) => {
    try {
      setDownloading(prev => ({ ...prev, [index]: true }));
      
      // Decode base64 data
      const byteCharacters = atob(invoice.data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = invoice.fileName || `invoice_${index + 1}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Failed to download invoice");
    } finally {
      setDownloading(prev => ({ ...prev, [index]: false }));
    }
  };

  const openInvoiceInNewTab = (invoice, index) => {
    try {
      const byteCharacters = atob(invoice.data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error opening invoice:", err);
      toast.error("Failed to open invoice");
    }
  };

  const handleBack = () => {
    navigate("/staff/orders");
  };


  if (loading) {
    return (
      <StaffMobileLayout>
        <div className="staff-invoice-container">
          <div className="staff-invoice-header">
            <button className="staff-invoice-back-btn" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
            <div className="staff-invoice-header-text">
              <h1>Invoice Download</h1>
              <p>Loading invoices for order {orderNumber}...</p>
            </div>
          </div>
          
          <div className="staff-invoice-loading">
            <Loader2 className="staff-invoice-spinner" size={48} />
            <p>Loading invoices...</p>
          </div>
        </div>
      </StaffMobileLayout>
    );
  }

  return (
    <StaffMobileLayout>
      <div className="staff-invoice-container">
        {/* Header */}
        <div className="staff-invoice-header">
          <button className="staff-invoice-back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="staff-invoice-header-text">
            <h1>Invoice Download</h1>
            <p>
              Order: {orderNumber} • {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="staff-invoice-content">
          {error ? (
            <div className="staff-invoice-error">
              <AlertCircle size={48} className="staff-invoice-error-icon" />
              <h3>Error Loading Invoices</h3>
              <p>{error}</p>
              <button 
                className="staff-invoice-retry-btn"
                onClick={fetchInvoices}
              >
                Try Again
              </button>
            </div>
          ) : invoices.length === 0 ? (
            <div className="staff-invoice-empty">
              <FileText size={64} className="staff-invoice-empty-icon" />
              <h3>No Invoices Found</h3>
              <p>No invoices available for order {orderNumber}</p>
              <button 
                className="staff-invoice-back-action-btn"
                onClick={handleBack}
              >
                Back to Orders
              </button>
            </div>
          ) : (
            <>
              {/* Success Message */}
              <div className="staff-invoice-success-alert">
                <CheckCircle size={20} />
                <p>
                  Found {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} for order {orderNumber}
                </p>
              </div>

              {/* Invoices List */}
              <div className="staff-invoice-list">
                {invoices.map((invoice, index) => (
                  <div className="staff-invoice-card" key={index}>
                    <div className="staff-invoice-card-header">
                      <div className="staff-invoice-card-title">
                        <FileText size={20} />
                        <h3>{invoice.fileName || `Invoice ${index + 1}`}</h3>
                      </div>
                      <span className="staff-invoice-badge">{invoice.status}</span>
                    </div>
                    
                    <div className="staff-invoice-card-body">
                     
                      
                      <div className="staff-invoice-actions">
                        <button
                          className="staff-invoice-download-btn"
                          onClick={() => downloadInvoice(invoice, index)}
                          disabled={downloading[index]}
                        >
                          {downloading[index] ? (
                            <>
                              <Loader2 className="staff-invoice-btn-spinner" size={16} />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Download
                            </>
                          )}
                        </button>
                        
                        <button
                          className="staff-invoice-open-btn"
                          onClick={() => openInvoiceInNewTab(invoice, index)}
                        >
                          <ExternalLink size={16} />
                          Open
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="staff-invoice-quick-actions">
                <button
                  className="staff-invoice-refresh-btn"
                  onClick={fetchInvoices}
                >
                  Refresh List
                </button>
                <button
                  className="staff-invoice-back-btn-secondary"
                  onClick={handleBack}
                >
                  Back to Orders
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </StaffMobileLayout>
  );
}

export default InvoiceDownload;
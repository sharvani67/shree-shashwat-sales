import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import StaffMobileLayout from '../StaffMobileLayout/StaffMobileLayout'
import './PendingInvoices.css'
import { baseurl } from '../../../../BaseURL/BaseURL'

const PendingInvoices = () => {
  const [transactions, setTransactions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })
  const [expandedInvoice, setExpandedInvoice] = useState(null)
  const [downloadLoading, setDownloadLoading] = useState({})

  // Get staff ID from localStorage
  const getStaffId = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        return user.id || user.staffid || user.userId || user.staff_id
      } catch (e) {
        console.error('Error parsing user data:', e)
        return null
      }
    }
    return null
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const staffId = getStaffId()
      if (!staffId) {
        setError('Unable to identify staff. Please login again.')
        setLoading(false)
        return
      }

      // Fetch all transactions
      const response = await axios.get(`${baseurl}/transactions`)
      
      if (response.data && Array.isArray(response.data)) {
        setTransactions(response.data)
        
        // Filter transactions by staffid AND TransactionType='Sales' on frontend
        const staffInvoices = response.data.filter(transaction => {
          // Check if transaction has staffid and it matches
          const isStaffMatch = parseInt(transaction.staffid) === parseInt(staffId)
          
          // Check if TransactionType is 'Sales' (case-insensitive)
          const isSalesType = transaction.TransactionType && 
                            transaction.TransactionType.toLowerCase() === 'sales'
          
          // Return true only if both conditions are met
          return isStaffMatch && isSalesType
        })
        
        // Transform to invoice format
        const formattedInvoices = staffInvoices.map(transaction => ({
          voucherId: transaction.VoucherID,
          invoiceNumber: transaction.InvoiceNumber,
          orderNumber: transaction.order_number,
          customerName: transaction.PartyName,
          invoiceDate: transaction.Date,
          dueDate: transaction.due_date,
          status: transaction.status, // This will be 'Pending', 'Partial', or 'Paid'
          totalAmount: transaction.TotalAmount,
          paidAmount: transaction.paid_amount,
          balanceAmount: transaction.balance_amount,
          pdfData: transaction.pdf_data,
          pdfFileName: transaction.pdf_file_name,
          hasPdf: !!transaction.pdf_data,
          staffId: transaction.staffid,
          assignedStaff: transaction.assigned_staff,
          businessName: transaction.business_name,
          email: transaction.email,
          mobileNumber: transaction.mobile_number,
          notePreview: transaction.note_preview,
          orderMode: transaction.order_mode,
          transactionType: transaction.TransactionType
        }))
        
        setInvoices(formattedInvoices)
        setFilteredInvoices(formattedInvoices)
      } else {
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err.response?.data?.message || 'Failed to load transactions')
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  // Check if invoice is overdue (Pending or Partial AND crossed due date)
  const isOverdue = (invoice) => {
    if (!invoice.dueDate) return false
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    try {
      const due = new Date(invoice.dueDate)
      due.setHours(23, 59, 59, 999) // End of the day
      
      // Check if status is Pending or Partial AND due date has passed
      const isPendingOrPartial = invoice.status === 'Pending' || invoice.status === 'Partial'
      const isDueDatePassed = due < today
      
      return isPendingOrPartial && isDueDatePassed
    } catch (e) {
      return false
    }
  }

  // Get display status (includes overdue logic)
  const getDisplayStatus = (invoice) => {
    if (isOverdue(invoice)) {
      return 'Overdue'
    }
    return invoice.status
  }

  const filterInvoices = () => {
    let filtered = [...invoices]

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(invoice => {
        const displayStatus = getDisplayStatus(invoice).toLowerCase()
        const filterStatus = filters.status.toLowerCase()
        
        return displayStatus === filterStatus
      })
    }

    // Filter by search term
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter(invoice =>
        (invoice.invoiceNumber?.toLowerCase().includes(searchTerm)) ||
        (invoice.orderNumber?.toLowerCase().includes(searchTerm)) ||
        (invoice.customerName?.toLowerCase().includes(searchTerm)) ||
        (invoice.businessName?.toLowerCase().includes(searchTerm))
      )
    }

    setFilteredInvoices(filtered)
  }

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status }))
  }

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }

  const viewInvoicePdf = async (invoice, index) => {
    if (!invoice.pdfData) {
      toast.error('No PDF available for this invoice')
      return
    }

    try {
      setDownloadLoading(prev => ({ ...prev, [index]: true }))
      
      let pdfData = invoice.pdfData
      
      // Clean the base64 data if it has data URL prefix
      if (pdfData.startsWith('data:application/pdf;base64,')) {
        pdfData = pdfData.replace('data:application/pdf;base64,', '')
      }
      
      const byteCharacters = atob(pdfData)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Open in new tab
      window.open(url, '_blank')
      
    } catch (err) {
      console.error('Error opening invoice:', err)
      toast.error('Failed to open invoice')
    } finally {
      setDownloadLoading(prev => ({ ...prev, [index]: false }))
    }
  }

  const downloadInvoice = async (invoice, index) => {
    if (!invoice.pdfData) {
      toast.error('No PDF available for download')
      return
    }

    try {
      setDownloadLoading(prev => ({ ...prev, [index]: true }))
      
      let pdfData = invoice.pdfData
      
      // Clean the base64 data if it has data URL prefix
      if (pdfData.startsWith('data:application/pdf;base64,')) {
        pdfData = pdfData.replace('data:application/pdf;base64,', '')
      }
      
      const byteCharacters = atob(pdfData)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = invoice.pdfFileName || `invoice_${invoice.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Invoice downloaded successfully!')
    } catch (err) {
      console.error('Error downloading invoice:', err)
      toast.error('Failed to download invoice')
    } finally {
      setDownloadLoading(prev => ({ ...prev, [index]: false }))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (e) {
      return 'Invalid Date'
    }
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0'
    try {
      return `₹${parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    } catch (e) {
      return '₹0'
    }
  }

  const getStatusColor = (status, isOverdueInvoice) => {
    if (isOverdueInvoice) {
      return 'invoice-status-overdue'
    }
    
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'invoice-status-paid'
      case 'partial':
        return 'invoice-status-partial'
      case 'pending':
        return 'invoice-status-pending'
      default:
        return 'invoice-status-default'
    }
  }

  const getStatusIcon = (status, isOverdueInvoice) => {
    if (isOverdueInvoice) {
      return <AlertTriangle size={16} />
    }
    
    switch(status?.toLowerCase()) {
      case 'paid':
        return <CheckCircle size={16} />
      case 'partial':
        return <Clock size={16} />
      case 'pending':
        return <Clock size={16} />
      default:
        return <FileText size={16} />
    }
  }

  const toggleInvoiceDetails = (invoiceId) => {
    if (expandedInvoice === invoiceId) {
      setExpandedInvoice(null)
    } else {
      setExpandedInvoice(invoiceId)
    }
  }

  const clearFilters = () => {
    setFilters({ status: 'all', search: '' })
  }

  if (loading) {
    return (
      <StaffMobileLayout>
        <div className="staff-pending-invoices-container">
          <div className="staff-pending-invoices-header">
            <h1 className="staff-pending-invoices-title">My Invoices</h1>
            <p className="staff-pending-invoices-subtitle">Loading your invoices...</p>
          </div>
          <div className="staff-pending-invoices-loading">
            <Loader2 className="staff-pending-invoices-spinner" size={48} />
            <p>Fetching invoices...</p>
          </div>
        </div>
      </StaffMobileLayout>
    )
  }

  return (
    <StaffMobileLayout>
      <div className="staff-pending-invoices-container">
        {/* Header */}
        <div className="staff-pending-invoices-header">
          <div className="staff-pending-invoices-header-content">
            <h1 className="staff-pending-invoices-title">Invoices</h1>
            <p className="staff-pending-invoices-subtitle">Track and manage your invoices</p>
          </div>
          <div className="staff-pending-invoices-stats">
            <div className="staff-pending-invoices-stat-item">
              <span className="staff-pending-invoices-stat-label">Total</span>
              <span className="staff-pending-invoices-stat-value">{invoices.length}</span>
            </div>
            <div className="staff-pending-invoices-stat-item">
              <span className="staff-pending-invoices-stat-label">Filtered</span>
              <span className="staff-pending-invoices-stat-value">{filteredInvoices.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="staff-pending-invoices-filters">
          <div className="staff-pending-invoices-search-box">
            <Search size={20} className="staff-pending-invoices-search-icon" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={filters.search}
              onChange={handleSearch}
              className="staff-pending-invoices-search-input"
            />
          </div>
          
          <div className="staff-pending-invoices-status-filters">
            <button
              className={`staff-pending-invoices-filter-btn ${filters.status === 'all' ? 'staff-pending-invoices-filter-active' : ''}`}
              onClick={() => handleStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`staff-pending-invoices-filter-btn ${filters.status === 'pending' ? 'staff-pending-invoices-filter-active' : ''}`}
              onClick={() => handleStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`staff-pending-invoices-filter-btn ${filters.status === 'partial' ? 'staff-pending-invoices-filter-active' : ''}`}
              onClick={() => handleStatusFilter('partial')}
            >
              Partial
            </button>
            <button
              className={`staff-pending-invoices-filter-btn ${filters.status === 'paid' ? 'staff-pending-invoices-filter-active' : ''}`}
              onClick={() => handleStatusFilter('paid')}
            >
              Paid
            </button>
            <button
              className={`staff-pending-invoices-filter-btn ${filters.status === 'overdue' ? 'staff-pending-invoices-filter-active' : ''}`}
              onClick={() => handleStatusFilter('overdue')}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="staff-pending-invoices-error">
            <AlertCircle size={32} className="staff-pending-invoices-error-icon" />
            <div className="staff-pending-invoices-error-content">
              <h3>Error Loading Invoices</h3>
              <p>{error}</p>
            </div>
            <button
              className="staff-pending-invoices-retry-btn"
              onClick={fetchTransactions}
            >
              Retry
            </button>
          </div>
        )}

        {/* No Invoices */}
        {!error && filteredInvoices.length === 0 && invoices.length === 0 && (
          <div className="staff-pending-invoices-empty">
            <Receipt size={64} className="staff-pending-invoices-empty-icon" />
            <h3>No Invoices Found</h3>
            <p>You have no invoices assigned to you</p>
            <button
              className="staff-pending-invoices-refresh-btn-primary"
              onClick={fetchTransactions}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        )}

        {!error && filteredInvoices.length === 0 && invoices.length > 0 && (
          <div className="staff-pending-invoices-empty">
            <FileText size={64} className="staff-pending-invoices-empty-icon" />
            <h3>No Matching Invoices</h3>
            <p>No invoices match your current filters</p>
            <button
              className="staff-pending-invoices-clear-filters-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Invoices List */}
        {!error && filteredInvoices.length > 0 && (
          <div className="staff-pending-invoices-list">
            {filteredInvoices.map((invoice, index) => {
              const overdueInvoice = isOverdue(invoice)
              const displayStatus = getDisplayStatus(invoice)
              
              return (
                <div 
                  key={`${invoice.voucherId}-${index}`} 
                  className={`staff-pending-invoice-card ${expandedInvoice === invoice.voucherId ? 'staff-pending-invoice-expanded' : ''} ${overdueInvoice ? 'staff-pending-invoice-overdue-card' : ''}`}
                >
                  {/* Card Header */}
                  <div 
                    className="staff-pending-invoice-card-header"
                    onClick={() => toggleInvoiceDetails(invoice.voucherId)}
                  >
                    <div className="staff-pending-invoice-header-left">
                      <div className="staff-pending-invoice-icon">
                        <FileText size={20} />
                      </div>
                      <div className="staff-pending-invoice-info">
                        <h3 className="staff-pending-invoice-number">{invoice.invoiceNumber}</h3>
                        <p className="staff-pending-invoice-order-number">{invoice.orderNumber}</p>
                      </div>
                    </div>
                    <div className="staff-pending-invoice-header-right">
                      <span className={`staff-pending-invoice-status-badge ${getStatusColor(invoice.status, overdueInvoice)}`}>
                        {getStatusIcon(invoice.status, overdueInvoice)}
                        {displayStatus}
                      </span>
                      {expandedInvoice === invoice.voucherId ? 
                        <ChevronUp size={20} /> : 
                        <ChevronDown size={20} />
                      }
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="staff-pending-invoice-basic-info">
                    <div className="staff-pending-invoice-info-row">
                      <div className="staff-pending-invoice-info-item">
                        <span className="staff-pending-invoice-info-label">Customer:</span>
                        <span className="staff-pending-invoice-info-value">{invoice.customerName}</span>
                      </div>
                      <div className="staff-pending-invoice-info-item">
                        <span className="staff-pending-invoice-info-label">Amount:</span>
                        <span className="staff-pending-invoice-info-amount">{formatCurrency(invoice.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="staff-pending-invoice-info-row">
                      <div className="staff-pending-invoice-info-item">
                        <span className="staff-pending-invoice-info-label">Date:</span>
                        <span className="staff-pending-invoice-info-value">{formatDate(invoice.invoiceDate)}</span>
                      </div>
                      <div className="staff-pending-invoice-info-item">
                        <span className="staff-pending-invoice-info-label">Due Date:</span>
                        <span className={`staff-pending-invoice-info-value ${overdueInvoice ? 'staff-pending-invoice-due-overdue' : ''}`}>
                          {formatDate(invoice.dueDate)}
                          {overdueInvoice && <span className="staff-pending-invoice-overdue-text"> (Overdue)</span>}
                        </span>
                      </div>
                      <div className="staff-pending-invoice-info-row">
                        <div className="staff-pending-invoice-info-item">
                          <span className="staff-pending-invoice-info-label">Paid:</span>
                          <span className="staff-pending-invoice-info-value">{formatCurrency(invoice.paidAmount)}</span>
                        </div>
                        <div className="staff-pending-invoice-info-item">
                          <span className="staff-pending-invoice-info-label">Balance:</span>
                          <span className="staff-pending-invoice-info-value">{formatCurrency(invoice.balanceAmount)}</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>

                  {/* Expanded Details */}
                  {expandedInvoice === invoice.voucherId && (
                    <div className="staff-pending-invoice-expanded-details">
                      {/* <div className="staff-pending-invoice-details-section">
                        <h4 className="staff-pending-invoice-details-title">Payment Details</h4>
                        <div className="staff-pending-invoice-details-grid">
                          <div className="staff-pending-invoice-detail-item">
                            <span className="staff-pending-invoice-detail-label">Total Amount:</span>
                            <span className="staff-pending-invoice-detail-value">{formatCurrency(invoice.totalAmount)}</span>
                          </div>
                          <div className="staff-pending-invoice-detail-item">
                            <span className="staff-pending-invoice-detail-label">Paid Amount:</span>
                            <span className="staff-pending-invoice-detail-value">{formatCurrency(invoice.paidAmount)}</span>
                          </div>
                          <div className="staff-pending-invoice-detail-item">
                            <span className="staff-pending-invoice-detail-label">Balance:</span>
                            <span className={`staff-pending-invoice-detail-value ${invoice.balanceAmount > 0 ? 'staff-pending-invoice-balance-pending' : 'staff-pending-invoice-balance-paid'}`}>
                              {formatCurrency(invoice.balanceAmount)}
                            </span>
                          </div>
                          <div className="staff-pending-invoice-detail-item">
                            <span className="staff-pending-invoice-detail-label">Status:</span>
                            <span className={`staff-pending-invoice-detail-value ${getStatusColor(invoice.status, overdueInvoice)}`}>
                              {displayStatus}
                            </span>
                          </div>
                        </div>
                      </div> */}

                      <div className="staff-pending-invoice-actions-section">
                        <h4 className="staff-pending-invoice-actions-title">Actions</h4>
                        <div className="staff-pending-invoice-action-buttons">
                          <button
                            className="staff-pending-invoice-action-btn staff-pending-invoice-view-btn"
                            onClick={() => viewInvoicePdf(invoice, index)}
                            disabled={!invoice.hasPdf || downloadLoading[index]}
                          >
                            {downloadLoading[index] ? (
                              <>
                                <Loader2 size={16} className="staff-pending-invoice-btn-spinner" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Eye size={16} />
                                View PDF
                              </>
                            )}
                          </button>
                          
                          <button
                            className="staff-pending-invoice-action-btn staff-pending-invoice-download-btn"
                            onClick={() => downloadInvoice(invoice, index)}
                            disabled={!invoice.hasPdf || downloadLoading[index]}
                          >
                            {downloadLoading[index] ? (
                              <>
                                <Loader2 size={16} className="staff-pending-invoice-btn-spinner" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                Download
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </StaffMobileLayout>
  )
}

export default PendingInvoices
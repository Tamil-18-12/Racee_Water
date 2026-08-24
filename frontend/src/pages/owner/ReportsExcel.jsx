import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getOrdersExcel,
  getCustomersExcel,
  getOrdersPdf,
  getCustomersPdf,
  getDailyReportPdf,
  downloadBlob,
} from '../../api/reportApi';
import { FaFileExcel, FaFilePdf, FaDownload, FaCalendarAlt, FaUsers, FaShoppingCart, FaShieldAlt } from 'react-icons/fa';

const ReportsExcel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState('');
  const [alert, setAlert] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleDownload = async (type) => {
    if (!user) {
      navigate('/owner/login');
      return;
    }

    setDownloading(type);
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      if (type === 'orders-excel') {
        const res = await getOrdersExcel(dateRange.from || undefined, dateRange.to || undefined);
        downloadBlob(res.data, `orders-report-${todayStr}.xlsx`);
        showAlert('✅ Orders Excel report downloaded successfully!');
      } else if (type === 'customers-excel') {
        const res = await getCustomersExcel();
        downloadBlob(res.data, `customers-report-${todayStr}.xlsx`);
        showAlert('✅ Customers Excel report downloaded successfully!');
      } else if (type === 'orders-pdf') {
        const res = await getOrdersPdf(dateRange.from || undefined, dateRange.to || undefined);
        downloadBlob(res.data, `orders-report-${todayStr}.pdf`);
        showAlert('✅ Orders PDF downloaded successfully!');
      } else if (type === 'customers-pdf') {
        const res = await getCustomersPdf();
        downloadBlob(res.data, `customers-report-${todayStr}.pdf`);
        showAlert('✅ Customers PDF downloaded successfully!');
      } else if (type === 'daily-pdf') {
        const res = await getDailyReportPdf(todayStr);
        downloadBlob(res.data, `daily-summary-${todayStr}.pdf`);
        showAlert('✅ Daily Summary PDF downloaded successfully!');
      }
    } catch (err) {
      console.error(err);
      showAlert('❌ Download failed. Please ensure you are logged in.', 'danger');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="main-content" style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      {alert && <div className={`alert-wc alert-${alert.type} mb-3`}>{alert.msg}</div>}

      <div className="page-header mb-4">
        <div>
          <div className="page-title">📊 Excel & PDF Reports Export</div>
          <small style={{ color: 'var(--text-muted)' }}>
            Export and download complete business data in Excel (.xlsx) and PDF formats
          </small>
        </div>
      </div>

      {!user ? (
        <div className="bookings-card p-4 text-center" style={{ maxWidth: 500, margin: '2rem auto' }}>
          <div style={{ fontSize: '3rem', color: '#0284c7', marginBottom: '1rem' }}>
            <FaShieldAlt />
          </div>
          <h4 className="fw-bold mb-2">Owner Authentication Required</h4>
          <p className="text-muted mb-4">
            Please log in as an owner to export and download Excel (.xlsx) sheets and business reports.
          </p>
          <button
            onClick={() => navigate('/owner/login')}
            className="btn-wc btn-wc-primary w-100 py-2 fw-bold"
          >
            Go to Owner Login
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Orders Excel Export Card */}
          <div className="col-12 col-md-6">
            <div
              className="bookings-card p-4 h-100 d-flex flex-column justify-content-between"
              style={{
                border: '1px solid #bbf7d0',
                background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(22, 101, 52, 0.08)',
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: '#16a34a',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    <FaFileExcel />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#166534' }}>
                      Orders Excel Report (.xlsx)
                    </h5>
                    <small className="text-muted">Export all order records, payments & empty can logs</small>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#374151' }}>
                  Contains detailed sheets with Order ID, Customer Name, Mobile, Delivery Address, Cans Delivered, Total Amount, Payment Mode, Status, and Return Tracking.
                </p>

                {/* Optional Date Filter */}
                <div className="p-3 mb-3" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <span className="fw-bold d-block mb-2" style={{ fontSize: '0.85rem', color: '#1f2937' }}>
                    <FaCalendarAlt style={{ marginRight: 6, color: '#16a34a' }} /> Filter Date Range (Optional):
                  </span>
                  <div className="row g-2">
                    <div className="col-6">
                      <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>From Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>To Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn-wc flex-fill py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ background: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 700 }}
                  disabled={downloading === 'orders-excel'}
                  onClick={() => handleDownload('orders-excel')}
                >
                  <FaDownload /> {downloading === 'orders-excel' ? 'Generating Excel...' : 'Download Orders Excel'}
                </button>
                <button
                  type="button"
                  className="btn-wc btn-wc-outline py-2 d-flex align-items-center justify-content-center gap-1"
                  disabled={downloading === 'orders-pdf'}
                  onClick={() => handleDownload('orders-pdf')}
                  title="Download Orders PDF"
                >
                  <FaFilePdf style={{ color: '#dc2626' }} /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Customers Excel Export Card */}
          <div className="col-12 col-md-6">
            <div
              className="bookings-card p-4 h-100 d-flex flex-column justify-content-between"
              style={{
                border: '1px solid #bfdbfe',
                background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(30, 64, 175, 0.08)',
              }}
            >
              <div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '12px',
                      background: '#0284c7',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}
                  >
                    <FaFileExcel />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: '#1e40af' }}>
                      Customers Excel Report (.xlsx)
                    </h5>
                    <small className="text-muted">Complete customer directory with order & balance stats</small>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#374151' }}>
                  Exports complete client database including Customer Name, Verified Phone Number, Address, Lifetime Orders, Total Amount Billed, Total Paid, Balance Due, and Pending Empty Cans.
                </p>

                <div className="p-3 mb-3" style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
                    <FaUsers style={{ color: '#0284c7' }} />
                    <span>Includes all registered customers and automatic balance calculations.</span>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  type="button"
                  className="btn-wc flex-fill py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ background: '#0284c7', borderColor: '#0284c7', color: '#fff', fontWeight: 700 }}
                  disabled={downloading === 'customers-excel'}
                  onClick={() => handleDownload('customers-excel')}
                >
                  <FaDownload /> {downloading === 'customers-excel' ? 'Generating Excel...' : 'Download Customers Excel'}
                </button>
                <button
                  type="button"
                  className="btn-wc btn-wc-outline py-2 d-flex align-items-center justify-content-center gap-1"
                  disabled={downloading === 'customers-pdf'}
                  onClick={() => handleDownload('customers-pdf')}
                  title="Download Customers PDF"
                >
                  <FaFilePdf style={{ color: '#dc2626' }} /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Daily PDF Summary Card */}
          <div className="col-12">
            <div
              className="bookings-card p-4 d-flex align-items-center justify-content-between flex-wrap gap-3"
              style={{
                border: '1px solid #fed7aa',
                background: 'linear-gradient(135deg, #fffaf5 0%, #ffffff 100%)',
                borderRadius: '16px',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: '#ea580c',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}
                >
                  <FaFilePdf />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold" style={{ color: '#9a3412' }}>
                    Today's Business Summary Report (PDF)
                  </h6>
                  <small className="text-muted">Instant 1-page summary of today's deliveries, payments, and stock</small>
                </div>
              </div>

              <button
                type="button"
                className="btn-wc btn-wc-outline d-flex align-items-center gap-2"
                style={{ borderColor: '#ea580c', color: '#ea580c', fontWeight: 600 }}
                disabled={downloading === 'daily-pdf'}
                onClick={() => handleDownload('daily-pdf')}
              >
                <FaDownload /> {downloading === 'daily-pdf' ? 'Downloading...' : "Download Today's PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsExcel;

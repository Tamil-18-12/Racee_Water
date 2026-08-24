import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers, searchCustomers } from '../../api/customerApi';
import { getCustomersExcel, getCustomersPdf, downloadBlob } from '../../api/reportApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import AddOrderModal from './modals/AddOrderModal';
import AddCustomerModal from './modals/AddCustomerModal';
import { getWhatsAppWelcomeUrl, openWhatsApp } from '../../utils/whatsappUtils';
import { FaWhatsapp, FaUserPlus, FaPlus } from 'react-icons/fa';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState(null);
  const [addOrderFor, setAddOrderFor] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const loadCustomers = async (q = '') => {
    setLoading(true);
    try {
      let res;
      if (q.trim()) {
        res = await searchCustomers(q.trim());
      } else {
        res = await getAllCustomers();
      }
      setCustomers(res.data.data || []);
    } catch {
      showAlert('Failed to load customers', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadCustomers(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePdf = async () => {
    try {
      const res = await getCustomersPdf();
      downloadBlob(res.data, `customers-${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert('Customer PDF report downloaded');
    } catch {
      showAlert('Failed to download PDF', 'danger');
    }
  };

  const handleExcel = async () => {
    try {
      const res = await getCustomersExcel();
      downloadBlob(res.data, `customers-${new Date().toISOString().split('T')[0]}.xlsx`);
      showAlert('Customer Excel report downloaded');
    } catch {
      showAlert('Failed to download Excel', 'danger');
    }
  };

  const handleRowWhatsApp = (e, customer) => {
    e.stopPropagation();
    const url = getWhatsAppWelcomeUrl(customer);
    if (url) openWhatsApp(url);
  };

  return (
    <div className="main-content" style={{ minHeight: '100vh' }}>
      {alert && <div className={`alert-wc alert-${alert.type}`}>{alert.msg}</div>}

      <div className="page-header">
        <div>
          <div className="page-title">👥 Customer Database</div>
          <small style={{ color: 'var(--text-muted)' }}>{customers.length} customer{customers.length !== 1 ? 's' : ''}</small>
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <button
            onClick={() => setShowAddCustomer(true)}
            className="btn-wc btn-wc-primary d-flex align-items-center gap-2"
          >
            <FaUserPlus /> Add Customer
          </button>
          <button onClick={handlePdf} className="btn-wc btn-wc-outline">📄 Export PDF</button>
          <button onClick={handleExcel} className="btn-wc btn-wc-outline">📊 Export Excel</button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or mobile number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        customers.length === 0 ? (
          <div className="empty-state bookings-card p-4 text-center">
            <div className="empty-state-icon">👥</div>
            <p className="mb-3">{searchQuery ? 'No customers found for your search.' : 'No customers yet.'}</p>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="btn-wc btn-wc-primary d-inline-flex align-items-center gap-2"
            >
              <FaUserPlus /> Add Your First Customer
            </button>
          </div>
        ) : (
          <div className="bookings-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const hasMoneyPending = (c.totalPending || 0) > 0;
                    const hasCansPending = (c.totalEmptyPending || 0) > 0;
                    const isPending = hasMoneyPending || hasCansPending;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/owner/customers/${c.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="booking-name">{c.name}</td>
                        <td className="booking-phone">{c.mobile || '—'}</td>
                        <td>
                          {isPending ? (
                            <span className="booking-status-badge pending">
                              Pending {hasMoneyPending ? `(₹${c.totalPending?.toFixed(0)})` : ''}
                            </span>
                          ) : (
                            <span className="booking-status-badge completed">Completed</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="d-inline-flex gap-2 align-items-center">
                            {c.mobile && (
                              <button
                                type="button"
                                className="btn-wc btn-wc-sm"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  background: '#25D366',
                                  borderColor: '#25D366',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                                onClick={(e) => handleRowWhatsApp(e, c)}
                                title="Send WhatsApp Message"
                              >
                                <FaWhatsapp size={14} /> WhatsApp
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-wc btn-wc-sm btn-wc-success"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', fontWeight: 600 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddOrderFor(c);
                              }}
                              title="Add New Order"
                            >
                              ➕ Order
                            </button>
                            <button
                              type="button"
                              className="btn-view-details"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/owner/customers/${c.id}`);
                              }}
                            >
                              View Details ›
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onSuccess={() => {
            loadCustomers(searchQuery);
            showAlert('Customer added successfully!');
          }}
          onAddOrderForCustomer={(newCust) => {
            setAddOrderFor(newCust);
          }}
        />
      )}

      {/* Add Order Modal */}
      {addOrderFor && (
        <AddOrderModal
          preselectedCustomer={addOrderFor}
          onClose={() => setAddOrderFor(null)}
          onSuccess={() => { setAddOrderFor(null); loadCustomers(searchQuery); showAlert('Order added!'); }}
        />
      )}
    </div>
  );
};

export default CustomerList;

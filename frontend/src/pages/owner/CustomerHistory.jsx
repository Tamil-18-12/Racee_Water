import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById } from '../../api/customerApi';
import { getOrdersByCustomer, addPayment, addEmptyCanReturn, updateOrderStatus, deleteOrder } from '../../api/orderApi';
import { getCustomerHistoryPdf, getOrdersExcel, downloadBlob } from '../../api/reportApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AddOrderModal from './modals/AddOrderModal';
import PaymentModal from './modals/PaymentModal';
import EmptyCanModal from './modals/EmptyCanModal';
import OrderDetailModal from './modals/OrderDetailModal';
import BookingsTable from '../../components/BookingsTable';
import { FaEye, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';


const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CustomerHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [addOrderModal, setAddOrderModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [emptyCanModal, setEmptyCanModal] = useState(null);
  const [orderDetailModal, setOrderDetailModal] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, oRes] = await Promise.all([
        getCustomerById(id),
        getOrdersByCustomer(id),
      ]);
      setCustomer(cRes.data.data);
      const o = oRes.data.data || [];
      setOrders(o);
      applyFilters(o, dateFilter, statusFilter);
      setOrderDetailModal(prev => prev ? o.find(x => x.id === prev.id) || null : null);
    } catch {
      showAlert('Failed to load customer data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const applyFilters = (o, df, sf) => {
    let result = [...o];
    const now = new Date();
    if (df === 'today') {
      result = result.filter(x => new Date(x.createdAt).toDateString() === now.toDateString());
    } else if (df === 'week') {
      const weekAgo = new Date(now - 7 * 86400000);
      result = result.filter(x => new Date(x.createdAt) >= weekAgo);
    } else if (df === 'month') {
      result = result.filter(x => {
        const d = new Date(x.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }
    if (sf !== 'all') result = result.filter(x => x.orderStatus === sf);
    setFiltered(result);
  };

  useEffect(() => { applyFilters(orders, dateFilter, statusFilter); }, [dateFilter, statusFilter, orders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      showAlert('Status updated');
      load();
    } catch { showAlert('Failed to update', 'danger'); }
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await deleteOrder(orderId);
      showAlert('Order deleted');
      load();
    } catch { showAlert('Failed to delete', 'danger'); }
  };


  const handlePdf = async () => {
    try {
      const res = await getCustomerHistoryPdf(id);
      downloadBlob(res.data, `${customer?.name}-history.pdf`);
    } catch { showAlert('Failed to generate PDF', 'danger'); }
  };

  if (loading) return <div className="main-content"><LoadingSpinner text="Loading customer history..." /></div>;
  if (!customer) return <div className="main-content"><div className="alert-wc alert-danger">Customer not found.</div></div>;

  const initials = customer.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const cleanPhone = (customer.mobile || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const customerWaUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hello ${customer.name}, greeting from Racee Water! 💧\n\nHow can we help you today?`
  )}`;

  return (
    <div className="main-content" style={{ minHeight: '100vh' }}>
      {alert && <div className={`alert-wc alert-${alert.type}`}>{alert.msg}</div>}

      {/* Back button */}
      <button onClick={() => navigate('/owner/customers')} className="btn-wc btn-wc-outline btn-wc-sm mb-3">
        ← Back to Customers
      </button>

      {/* Customer Profile Header */}
      <div className="customer-profile-header mb-4">
        <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h4 className="mb-0 fw-bold">{customer.name}</h4>
            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <span style={{ opacity: 0.9, fontSize: '0.9rem' }}>📱 {customer.mobile}</span>
              <a href={`tel:${customer.mobile}`} className="btn-wc btn-wc-sm btn-wc-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>
                <FaPhoneAlt /> Call
              </a>
              <a href={customerWaUrl} target="_blank" rel="noopener noreferrer" className="btn-wc btn-wc-sm btn-wc-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>
                <FaWhatsapp /> WhatsApp
              </a>
            </div>
            {customer.address && <div style={{ opacity: 0.75, fontSize: '0.85rem', marginTop: 4 }}>📍 {customer.address}</div>}
            <div style={{ opacity: 0.65, fontSize: '0.8rem' }}>Member since {fmt(customer.createdAt)}</div>
          </div>
          <div className="ms-auto d-flex gap-2 flex-wrap">
            <button onClick={() => setAddOrderModal(true)} className="btn-wc btn-wc-success">➕ Add Order</button>
            <button onClick={handlePdf} className="btn-wc btn-wc-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>📄 PDF</button>
          </div>
        </div>

        <div className="row g-2">
          {[
            { label: 'Orders', value: customer.totalOrders },
            { label: 'Total Cans', value: `💧 ${customer.totalCans}` },
            { label: 'Total Amount', value: `₹${customer.totalAmount?.toFixed(0)}` },
            { label: 'Amount Paid', value: `₹${customer.totalPaid?.toFixed(0)}` },
            { label: 'Balance Pending', value: `₹${customer.totalPending?.toFixed(0)}` },
            { label: 'Empty Pending', value: `♻️ ${customer.totalEmptyPending}` },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-2">
              <div className="profile-stat">
                <div className="profile-stat-value">{s.value}</div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-3 mb-3 flex-wrap align-items-center">
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Period:</span>
          <div className="filter-chips d-inline-flex">
            {[['all', 'All Time'], ['today', 'Today'], ['week', 'This Week'], ['month', 'This Month']].map(([v, l]) => (
              <button key={v} className={`chip ${dateFilter === v ? 'active' : ''}`} onClick={() => setDateFilter(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Status:</span>
          <select className="form-select d-inline-block" style={{ width: 'auto', fontSize: '0.85rem' }}
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            {['PENDING','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <div className="ms-auto" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing {filtered.length} of {orders.length} orders
        </div>
      </div>

      {/* Bookings Table */}
      {filtered.length === 0 ? (
        <div className="empty-state bookings-card p-4">
          <div className="empty-state-icon">📋</div>
          <p>No bookings found for selected filter</p>
        </div>
      ) : (
        <BookingsTable
          orders={filtered}
          onViewDetails={(ord) => setOrderDetailModal(ord)}
        />
      )}


      {/* Modals */}
      {orderDetailModal && (
        <OrderDetailModal
          order={orderDetailModal}
          onClose={() => setOrderDetailModal(null)}
          onOpenPayment={(ord) => setPaymentModal(ord)}
          onOpenEmptyCan={(ord) => setEmptyCanModal(ord)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {addOrderModal && (
        <AddOrderModal
          preselectedCustomer={customer}
          onClose={() => setAddOrderModal(false)}
          onSuccess={() => { setAddOrderModal(false); load(); showAlert('Order added!'); }}
        />
      )}
      {paymentModal && (
        <PaymentModal order={paymentModal} onClose={() => setPaymentModal(null)}
          onSuccess={() => { setPaymentModal(null); load(); showAlert('Payment recorded!'); }} />
      )}
      {emptyCanModal && (
        <EmptyCanModal order={emptyCanModal} onClose={() => setEmptyCanModal(null)}
          onSuccess={() => { setEmptyCanModal(null); load(); showAlert('Empty can return recorded!'); }} />
      )}
    </div>
  );
};

export default CustomerHistory;


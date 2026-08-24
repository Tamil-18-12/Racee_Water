import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../api/orderApi';
import { getOrdersExcel, getOrdersPdf, downloadBlob } from '../../api/reportApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import PaymentModal from './modals/PaymentModal';
import EmptyCanModal from './modals/EmptyCanModal';
import AddOrderModal from './modals/AddOrderModal';
import OrderDetailModal from './modals/OrderDetailModal';
import BookingsTable from '../../components/BookingsTable';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [emptyCanModal, setEmptyCanModal] = useState(null);
  const [orderDetailModal, setOrderDetailModal] = useState(null);
  const [addOrderModal, setAddOrderModal] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', payment: 'all', mode: 'all', canStatus: 'all', source: 'all', search: '' });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders();
      const o = res.data.data || [];
      setOrders(o);
      setOrderDetailModal(prev => prev ? o.find(x => x.id === prev.id) || null : null);
    } catch { showAlert('Failed to load orders', 'danger'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = [...orders];
    if (filters.status !== 'all') result = result.filter(o => o.orderStatus === filters.status);
    if (filters.payment !== 'all') result = result.filter(o => o.paymentStatus === filters.payment);
    if (filters.mode !== 'all') result = result.filter(o => o.paymentMode === filters.mode);
    if (filters.canStatus === 'returned') result = result.filter(o => o.emptyCansPending === 0);
    if (filters.canStatus === 'pending') result = result.filter(o => o.emptyCansPending > 0);
    if (filters.source !== 'all') result = result.filter(o => o.orderSource === filters.source);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(o =>
        o.customerName?.toLowerCase().includes(q) ||
        o.mobile?.includes(q) ||
        o.orderId?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [filters, orders]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await deleteOrder(id);
      showAlert('Order deleted');
      load();
    } catch { showAlert('Failed to delete', 'danger'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      showAlert('Order status updated');
      load();
    } catch {
      showAlert('Failed to update status', 'danger');
    }
  };

  const handlePdf = async () => {
    try {
      const res = await getOrdersPdf();
      downloadBlob(res.data, `orders-${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert('Orders PDF downloaded');
    } catch { showAlert('Failed to download PDF', 'danger'); }
  };

  const handleExcel = async () => {
    try {
      const res = await getOrdersExcel();
      downloadBlob(res.data, `orders-${new Date().toISOString().split('T')[0]}.xlsx`);
      showAlert('Orders Excel downloaded');
    } catch { showAlert('Failed to download Excel', 'danger'); }
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div className="main-content" style={{ minHeight: '100vh' }}>
      {alert && <div className={`alert-wc alert-${alert.type}`}>{alert.msg}</div>}

      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0f172a', marginBottom: '0.2rem' }}>Bookings</h2>
          <div style={{ color: '#64748b', fontSize: '0.95rem' }}>View all customer bookings</div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button onClick={() => setAddOrderModal(true)} className="btn-wc btn-wc-primary">➕ Add Order</button>
          <button onClick={handlePdf} className="btn-wc btn-wc-outline">📄 PDF</button>
          <button onClick={handleExcel} className="btn-wc btn-wc-outline">📊 Excel</button>
        </div>
      </div>


      {/* Filters */}
      <div className="wc-table-wrapper p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" className="form-control" placeholder="Search name, mobile, order ID..."
                value={filters.search} onChange={e => setFilter('search', e.target.value)} />
            </div>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
              <option value="all">Status: All</option>
              {['PENDING','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED'].map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.payment} onChange={e => setFilter('payment', e.target.value)}>
              <option value="all">Payment: All</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Unpaid</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.mode} onChange={e => setFilter('mode', e.target.value)}>
              <option value="all">Mode: All</option>
              <option value="CASH">💵 Cash</option>
              <option value="ONLINE">📱 Online / UPI</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={filters.canStatus} onChange={e => setFilter('canStatus', e.target.value)}>
              <option value="all">Empty Cans: All</option>
              <option value="returned">✅ Returned</option>
              <option value="pending">⏳ Pending Return</option>
            </select>
          </div>
          <div className="col-md-1">
            <button onClick={() => setFilters({ status: 'all', payment: 'all', mode: 'all', canStatus: 'all', source: 'all', search: '' })}
              className="btn-wc btn-wc-outline w-100" title="Reset Filters">🔄</button>
          </div>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No orders found matching your filters</p>
          </div>
        ) : (
          <BookingsTable
            orders={filtered}
            onViewDetails={(ord) => setOrderDetailModal(ord)}
          />
        )
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
      {addOrderModal && <AddOrderModal onClose={() => setAddOrderModal(false)} onSuccess={() => { setAddOrderModal(false); load(); showAlert('Order added!'); }} />}
      {paymentModal && <PaymentModal order={paymentModal} onClose={() => setPaymentModal(null)} onSuccess={() => { setPaymentModal(null); load(); showAlert('Payment recorded!'); }} />}
      {emptyCanModal && <EmptyCanModal order={emptyCanModal} onClose={() => setEmptyCanModal(null)} onSuccess={() => { setEmptyCanModal(null); load(); showAlert('Empty can return recorded!'); }} />}
    </div>
  );
};

export default OrderList;



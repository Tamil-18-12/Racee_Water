import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummary } from '../../api/dashboardApi';
import { getTodayOrders, updateOrderStatus, addPayment, addEmptyCanReturn, deleteOrder } from '../../api/orderApi';
import { getSettings } from '../../api/settingsApi';
import { getOrdersExcel, getDailyReportPdf, downloadBlob } from '../../api/reportApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import AddOrderModal from './modals/AddOrderModal';
import PaymentModal from './modals/PaymentModal';
import EmptyCanModal from './modals/EmptyCanModal';
import OrderDetailModal from './modals/OrderDetailModal';
import BookingsTable from '../../components/BookingsTable';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

import {
  FaUsers, FaShoppingCart, FaWater, FaMoneyBillWave,
  FaCheckCircle, FaChartLine, FaCog, FaSignOutAlt, FaSearch,
  FaPlus, FaList, FaHome, FaEye
} from 'react-icons/fa';

const PIE_COLORS = ['#06d6a0', '#ffd166', '#ef476f'];

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOrderModal, setAddOrderModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);
  const [emptyCanModal, setEmptyCanModal] = useState(null);
  const [orderDetailModal, setOrderDetailModal] = useState(null);
  const [alert, setAlert] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, todayRes] = await Promise.all([
        getDashboardSummary(),
        getTodayOrders(),
      ]);
      setSummary(sumRes.data.data);
      const orders = todayRes.data.data || [];
      setTodayOrders(orders);
      // Keep orderDetailModal updated if open
      setOrderDetailModal((prev) => (prev ? orders.find((o) => o.id === prev.id) || null : null));
    } catch (e) {
      showAlert('Failed to load dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      showAlert('Order status updated successfully');
      load();
    } catch (e) {
      showAlert('Failed to update status', 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return;
    try {
      await deleteOrder(id);
      showAlert('Order deleted');
      load();
    } catch {
      showAlert('Failed to delete', 'danger');
    }
  };


  const handleDownloadPdf = async () => {
    try {
      const res = await getDailyReportPdf();
      downloadBlob(res.data, `daily-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch { showAlert('Failed to download PDF', 'danger'); }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await getOrdersExcel();
      downloadBlob(res.data, `orders-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch { showAlert('Failed to download Excel', 'danger'); }
  };

  const summaryCards = summary ? [
    { label: "Today's Orders", value: summary.todayOrders, icon: '📋', color: '#0077b6' },
    { label: "Today's Cans", value: summary.todayCans, icon: '💧', color: '#00b4d8' },
    { label: 'Pending Orders', value: summary.pendingOrders, icon: '⏳', color: '#ffd166' },
    { label: 'Delivered', value: summary.deliveredOrders, icon: '✅', color: '#06d6a0' },
    { label: 'Money Pending', value: `₹${summary.moneyPending?.toFixed(0) || 0}`, icon: '💵', color: '#ef476f' },
    { label: "Empty Cans Pending", value: summary.emptyCansPending, icon: '♻️', color: '#6c5ce7' },
  ] : [];

  const pieData = summary ? [
    { name: 'Paid', value: summary.paidCount },
    { name: 'Partial', value: summary.partialCount },
    { name: 'Pending', value: summary.pendingPaymentCount },
  ] : [];

  const SidebarContent = () => (
    <>
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>💧</span>
          <div>
            <h5 className="mb-0">Racee Water</h5>
            <small>Owner Dashboard</small>
          </div>
        </div>
      </div>

      <ul className="sidebar-nav">
        <li><NavLink to="/owner/dashboard" className={({ isActive }) => isActive ? 'active' : ''}><FaHome /> Dashboard</NavLink></li>
        <li><NavLink to="/owner/customers" className={({ isActive }) => isActive ? 'active' : ''}><FaUsers /> Customers</NavLink></li>
        <li><NavLink to="/owner/orders" className={({ isActive }) => isActive ? 'active' : ''}><FaList /> All Orders</NavLink></li>
        <li><NavLink to="/owner/settings" className={({ isActive }) => isActive ? 'active' : ''}><FaCog /> Settings</NavLink></li>
        <li style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <NavLink to="/" style={{ color: 'rgba(255,255,255,0.6)' }}><FaHome /> Customer Site</NavLink>
        </li>
        <li>
          <button onClick={logout}><FaSignOutAlt /> Logout</button>
        </li>
      </ul>
    </>
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar d-none d-md-block"><SidebarContent /></aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }} onClick={() => setSidebarOpen(false)}>
          <div style={{ width: 260, height: '100%', background: 'linear-gradient(180deg, #023e8a, #01579b)', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      <main className="main-content">
        {/* Alert */}
        {alert && <div className={`alert-wc alert-${alert.type} mb-3`}>{alert.msg}</div>}

        {/* Header */}
        <div className="page-header">
          <div className="d-flex align-items-center gap-3">
            <button className="mobile-sidebar-toggle d-md-none" onClick={() => setSidebarOpen(true)}>☰</button>
            <div>
              <div className="page-title">📊 Dashboard</div>
              <small style={{ color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button onClick={() => setAddOrderModal(true)} className="btn-wc btn-wc-primary">
              <FaPlus /> Add Order
            </button>
            <button onClick={handleDownloadPdf} className="btn-wc btn-wc-outline">📄 Daily PDF</button>
            <button onClick={handleDownloadExcel} className="btn-wc btn-wc-outline">📊 Excel</button>
          </div>
        </div>

        {loading ? <LoadingSpinner text="Loading dashboard..." /> : (
          <>
            {/* Summary Cards */}
            <div className="row g-3 mb-4">
              {summaryCards.map((c, i) => (
                <div key={i} className="col-6 col-md-4 col-xl-2">
                  <div className="summary-card" style={{ '--card-color': c.color }}>
                    <div className="card-icon">{c.icon}</div>
                    <div className="card-value">{c.value}</div>
                    <div className="card-label">{c.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="row g-3 mb-4">
              <div className="col-md-5">
                <div className="chart-card">
                  <div className="chart-title">📈 Orders - Last 7 Days</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={summary?.dailyOrdersChart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#0077b6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-4">
                <div className="chart-card">
                  <div className="chart-title">💰 Sales - Last 7 Days</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={summary?.dailySalesChart || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `₹${v}`} />
                      <Line type="monotone" dataKey="sales" stroke="#00b4d8" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-3">
                <div className="chart-card">
                  <div className="chart-title">💳 Payment Status</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Today's Bookings */}
            <div style={{ marginTop: '1.5rem' }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#0f172a', marginBottom: '0.15rem' }}>Today's Bookings</h4>
                  <div style={{ color: '#64748b', fontSize: '0.88rem' }}>View today's customer bookings ({todayOrders.length})</div>
                </div>
                <button onClick={load} className="btn-wc btn-wc-outline btn-wc-sm">🔄 Refresh</button>
              </div>

              {todayOrders.length === 0 ? (
                <div className="empty-state bookings-card p-4">
                  <div className="empty-state-icon">📋</div>
                  <p>No bookings today yet</p>
                </div>
              ) : (
                <BookingsTable
                  orders={todayOrders}
                  onViewDetails={(ord) => setOrderDetailModal(ord)}
                />
              )}
            </div>

          </>
        )}
      </main>

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
        <AddOrderModal onClose={() => setAddOrderModal(false)} onSuccess={() => { setAddOrderModal(false); load(); showAlert('Order added successfully!'); }} />
      )}
      {paymentModal && (
        <PaymentModal order={paymentModal} onClose={() => setPaymentModal(null)} onSuccess={() => { setPaymentModal(null); load(); showAlert('Payment recorded!'); }} />
      )}
      {emptyCanModal && (
        <EmptyCanModal order={emptyCanModal} onClose={() => setEmptyCanModal(null)} onSuccess={() => { setEmptyCanModal(null); load(); showAlert('Empty can return recorded!'); }} />
      )}

    </div>
  );
};

export default Dashboard;


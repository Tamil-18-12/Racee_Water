import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import BookWater from './pages/BookWater';
import OwnerLogin from './pages/OwnerLogin';
import About from './pages/About';
import Help from './pages/Help';

// Owner pages
import Dashboard from './pages/owner/Dashboard';
import CustomerList from './pages/owner/CustomerList';
import CustomerHistory from './pages/owner/CustomerHistory';
import OrderList from './pages/owner/OrderList';
import Settings from './pages/owner/Settings';
import ReportsExcel from './pages/owner/ReportsExcel';

// ─── Public Layout (Navbar + Footer) ─────────────────────
const PublicLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
    <Footer />
  </div>
);

// ─── Owner Sidebar Shell ──────────────────────────────────
const OwnerShell = ({ children }) => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarLinks = () => (
    <>
      <div className="sidebar-brand">
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>💧</span>
          <div>
            <h5 className="mb-0">Racee Water</h5>
            <small>Owner Panel</small>
          </div>
        </div>
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/owner/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            🏠 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner/customers" className={({ isActive }) => isActive ? 'active' : ''}>
            👥 Customers
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner/orders" className={({ isActive }) => isActive ? 'active' : ''}>
            📋 All Orders
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner/reports" className={({ isActive }) => isActive ? 'active' : ''}>
            📊 Reports & Excel
          </NavLink>
        </li>
        <li>
          <NavLink to="/owner/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            ⚙️ Settings
          </NavLink>
        </li>
        <li style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <NavLink to="/" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>
            🌐 Customer Site
          </NavLink>
        </li>
        <li>
          <button onClick={logout}>🚪 Logout</button>
        </li>
      </ul>
    </>
  );

  return (
    <div className="dashboard-layout">
      {/* Desktop sidebar */}
      <aside className="sidebar d-none d-md-block">
        <SidebarLinks />
      </aside>

      {/* Mobile overlay sidebar */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200 }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              width: 260,
              height: '100%',
              background: 'linear-gradient(180deg, #023e8a, #01579b)',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarLinks />
          </div>
        </div>
      )}

      {/* Page content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile top bar */}
        <div
          className="d-md-none d-flex align-items-center gap-2 p-2"
          style={{ background: 'var(--primary-dark)', position: 'sticky', top: 0, zIndex: 100 }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              borderRadius: 6,
              padding: '0.4rem 0.65rem',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >
            ☰
          </button>
          <span style={{ color: '#fff', fontWeight: 700 }}>💧 Racee Water</span>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── App Routes ───────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
    <Route path="/book" element={<PublicLayout><BookWater /></PublicLayout>} />
    <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
    <Route path="/help" element={<PublicLayout><Help /></PublicLayout>} />
    <Route path="/owner/login" element={<OwnerLogin />} />

    {/* Dashboard has its own built-in sidebar */}
    <Route
      path="/owner/dashboard"
      element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
    />

    {/* Other owner pages use OwnerShell for shared sidebar */}
    <Route
      path="/owner/customers"
      element={<ProtectedRoute><OwnerShell><CustomerList /></OwnerShell></ProtectedRoute>}
    />
    <Route
      path="/owner/customers/:id"
      element={<ProtectedRoute><OwnerShell><CustomerHistory /></OwnerShell></ProtectedRoute>}
    />
    <Route
      path="/owner/orders"
      element={<ProtectedRoute><OwnerShell><OrderList /></OwnerShell></ProtectedRoute>}
    />
    <Route
      path="/owner/reports"
      element={<ProtectedRoute><OwnerShell><ReportsExcel /></OwnerShell></ProtectedRoute>}
    />
    {/* Shortcuts for Excel Reports */}
    <Route
      path="/xl"
      element={<OwnerShell><ReportsExcel /></OwnerShell>}
    />
    <Route
      path="/excel"
      element={<OwnerShell><ReportsExcel /></OwnerShell>}
    />
    <Route
      path="/owner/settings"
      element={<ProtectedRoute><OwnerShell><Settings /></OwnerShell></ProtectedRoute>}
    />

    {/* 404 */}
    <Route
      path="*"
      element={
        <PublicLayout>
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontSize: '7rem', marginBottom: '1rem' }}>💧</div>
            <h2 style={{ color: 'var(--primary-dark)', fontWeight: 800, marginBottom: '1rem' }}>
              Page Not Found
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              The page you're looking for doesn't exist.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: '#fff',
                padding: '0.85rem 2rem',
                borderRadius: '50px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ← Go Home
            </a>
          </div>
        </PublicLayout>
      }
    />
  </Routes>
);

// ─── Root ─────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;

import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaWater, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="wc-navbar">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between">
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <FaWater style={{ color: '#90e0ef' }} />
            <span>Racee Water</span>
          </Link>

          {/* Desktop Nav */}
          <div className="d-none d-md-flex align-items-center gap-2">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/book" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Book Water</NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
            <NavLink to="/help" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Help</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/owner/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
                <button onClick={logout} className="nav-link btn-book ms-2" style={{ cursor: 'pointer' }}>Logout</button>
              </>
            ) : (
              <NavLink to="/owner/login" className={({ isActive }) => `nav-link btn-book ms-2 ${isActive ? 'active' : ''}`}>Owner Login</NavLink>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="d-md-none btn-hero-outline py-2 px-3 border-0" onClick={toggleMenu}
            style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}>
            {menuOpen ? <FaTimes color="#fff" /> : <FaBars color="#fff" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="d-md-none mt-3 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="d-flex flex-column gap-1 pt-2">
              <NavLink to="/" className="nav-link" onClick={closeMenu}>🏠 Home</NavLink>
              <NavLink to="/book" className="nav-link btn-book text-center mt-1" onClick={closeMenu}>💧 Book Water</NavLink>
              <NavLink to="/about" className="nav-link" onClick={closeMenu}>ℹ️ About</NavLink>
              <NavLink to="/help" className="nav-link" onClick={closeMenu}>❓ Help</NavLink>
              {isAuthenticated ? (
                <>
                  <NavLink to="/owner/dashboard" className="nav-link" onClick={closeMenu}>📊 Dashboard</NavLink>
                  <button onClick={() => { logout(); closeMenu(); }} className="nav-link text-start border-0 bg-transparent">🔒 Logout</button>
                </>
              ) : (
                <NavLink to="/owner/login" className="nav-link" onClick={closeMenu}>🔑 Owner Login</NavLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

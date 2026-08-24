import React from 'react';
import { Link } from 'react-router-dom';
import { FaWater, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="wc-footer">
    <div className="container">
      <div className="row g-4">
        <div className="col-md-4">
          <div className="footer-brand d-flex align-items-center gap-2 mb-2">
            <FaWater style={{ color: '#90e0ef' }} />
            Racee Water
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
            Pure drinking water delivered to your doorstep. Serving Laligam, Dharmapuri with love and care.
          </p>
          <div className="mt-2 d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
            <FaPhone style={{ color: '#90e0ef' }} />
            <span>9345038836</span>
          </div>
          <div className="mt-1 d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
            <FaMapMarkerAlt style={{ color: '#90e0ef' }} />
            <span>Laligam bus stop, Laligam, Dharmapuri 636804</span>
          </div>
        </div>

        <div className="col-md-2">
          <div className="footer-title">Quick Links</div>
          <Link to="/" className="footer-link">🏠 Home</Link>
          <Link to="/book" className="footer-link">💧 Book Water</Link>
          <Link to="/about" className="footer-link">ℹ️ About Us</Link>
          <Link to="/help" className="footer-link">❓ Help</Link>
        </div>

        <div className="col-md-3">
          <div className="footer-title">Services</div>
          <a className="footer-link">🚚 Doorstep Delivery</a>
          <a className="footer-link">📦 Bulk Orders</a>
          <a className="footer-link">💰 Flexible Payment</a>
          <a className="footer-link">♻️ Empty Can Return</a>
        </div>
        <div className="col-md-3">
          <div className="footer-title">Developer</div>
          <a href="mailto:tamilanbu423@gmail.com" className="footer-link">
            ✉️ tamilanbu423@gmail.com
          </a>
          <span className="footer-link" style={{ opacity: 0.75, fontSize: '0.82rem' }}>
            🚀 Web & App Development
          </span>
        </div>



      </div>


    </div>
  </footer>
);

export default Footer;

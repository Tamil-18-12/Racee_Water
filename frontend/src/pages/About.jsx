import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const reasons = [
    { icon: '🌊', title: 'Pure & Fresh', desc: 'We source only high-quality, purified water to keep your family safe and healthy.' },
    { icon: '🚚', title: 'Reliable Delivery', desc: 'Count on us for timely delivery every single time. No delays, no excuses.' },
    { icon: '💰', title: 'Affordable Prices', desc: 'Village-friendly pricing with flexible payment options to suit every family.' },
    { icon: '👨‍👩‍👧‍👦', title: 'Community First', desc: 'We are part of this village. We care about every family we serve.' },
  ];

  return (
    <>
      <div className="about-hero">
        <div className="container py-4">
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>ℹ️ Our Story</span>
          <h1 className="hero-title mt-2" style={{ fontSize: '2.5rem' }}>About Racee Water Delivery</h1>
          <p className="hero-subtitle mx-auto" style={{ maxWidth: 560 }}>
            A local water-can delivery service providing clean drinking water directly to homes, shops, and businesses in Laligam, Dharmapuri.
          </p>
        </div>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <span className="section-badge">💙 Our Mission</span>
              <h2 className="section-title mt-2">Clean Water for Every Home</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Racee Water started as a small initiative to solve a simple problem — getting clean drinking water to every family without hassle. 
                Today, we serve hundreds of homes, shops, and businesses, delivering pure water cans right to your doorstep.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                Our digital booking system makes it easy for customers to order online, and our owner management system keeps everything organized — 
                from order tracking to payment management and empty can returns.
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <span style={{ fontSize: '10rem' }}>🏡</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span className="section-badge">⭐ Why Choose Us</span>
            <h2 className="section-title mt-2">The Racee Water Difference</h2>
          </div>
          <div className="row g-4">
            {reasons.map((r, i) => (
              <div key={i} className="col-sm-6 col-lg-3">
                <div className="about-card text-center">
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{r.icon}</div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{r.title}</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="about-card">
                <h4 style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>🚚 Our Services</h4>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <li>20-liter water can home delivery</li>
                  <li>Daily, weekly, and on-demand delivery</li>
                  <li>Bulk orders for shops and businesses</li>
                  <li>Empty can collection and tracking</li>
                  <li>Flexible payment — pay now or later</li>
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="about-card">
                <h4 style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>📍 Delivery Area</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1rem' }}>
                  We currently serve all areas in and around Laligam, Dharmapuri.
                </p>
                <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>📞 Contact Us</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    <div>📱 9345038836</div>
                    <div className="mt-1">🏠 Laligam bus stop, Laligam, Dharmapuri 636804</div>
                    <div className="mt-1">🕒 Delivery Hours: 7 AM – 7 PM</div>
                  </div>
                </div>
                <Link to="/book" className="btn-primary-wc d-block text-center mt-3">💧 Book Water Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;

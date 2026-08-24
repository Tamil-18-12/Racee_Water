import React from 'react';
import { Link } from 'react-router-dom';
import { FaWater, FaCheckCircle, FaTruck, FaMoneyBillWave, FaRecycle } from 'react-icons/fa';

const Home = () => {
  const features = [
    { icon: '📱', title: 'Easy Booking', desc: 'Book water cans in seconds with just your name and mobile number. No registration required.' },
    { icon: '🚚', title: 'Doorstep Delivery', desc: 'We deliver fresh, clean drinking water cans directly to your home or business.' },
    { icon: '💰', title: 'Flexible Payment', desc: 'Pay now, pay later, or pay partially. We understand your needs and work with you.' },
    { icon: '♻️', title: 'Empty Can Return', desc: 'Return your empty cans at your convenience. We track every can returned.' },
  ];

  const steps = [
    { text: 'Enter your name and mobile number' },
    { text: 'Select the number of water cans you need' },
    { text: 'Submit your order with any special notes' },
    { text: 'Our team delivers to your doorstep' },
    { text: 'Pay now, partially, or later — your choice' },
    { text: 'Return empty cans whenever convenient' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container py-3">
          <div className="row align-items-center g-4">
            <div className="col-lg-6 order-2 order-lg-1">
              <span className="section-badge">🌊 Fresh Water Delivery</span>
              <h1 className="hero-title">
                Pure Water Delivered to Your Doorstep
              </h1>
              <p className="hero-subtitle">
                Easy booking, reliable delivery, and simple customer service — crafted for our village community.
              </p>
              <div className="hero-btns">
                <Link to="/book" className="btn-hero-primary">💧 Book Water Can</Link>
                <Link to="/help" className="btn-hero-outline">📞 Contact Us</Link>
              </div>

              <div className="d-flex gap-4 mt-4 flex-wrap">
                {[['500+', 'Happy Customers'], ['5000+', 'Cans Delivered'], ['100%', 'Pure Water']].map(([val, label]) => (
                  <div key={label} style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#90e0ef' }}>{val}</div>
                    <div style={{ fontSize: '0.82rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6 order-1 order-lg-2 hero-illustration">
              <div className="water-drop-large">💧</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-4">
            <span className="section-badge">✨ Why Choose Us</span>
            <h2 className="section-title mt-2">Simple. Reliable. Affordable.</h2>
            <p className="section-subtitle">Everything you need for clean water delivery, nothing you don't.</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-sm-6 col-lg-3">
                <div className="feature-card">
                  <span className="feature-icon">{f.icon}</span>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="section-badge">📋 Simple Process</span>
            <h2 className="section-title mt-2">How It Works</h2>
            <p className="section-subtitle">Getting clean water delivered has never been easier.</p>
          </div>
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {steps.map((step, i) => (
                <div className="step-card" key={i}>
                  <div className="step-number">{i + 1}</div>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>{step.text}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-4">
            <Link to="/book" className="btn-hero-primary" style={{ display: 'inline-block', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              💧 Book Your Water Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #023e8a, #0077b6)' }}>
        <div className="container text-center" style={{ color: '#fff' }}>
          <h2 style={{ fontWeight: 800, fontSize: '2rem', marginBottom: '0.75rem' }}>
            Ready for Fresh Water? 💧
          </h2>
          <p style={{ opacity: 0.85, marginBottom: '1.75rem', fontSize: '1.05rem' }}>
            Join hundreds of happy families getting clean water delivered every day.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/book" className="btn-hero-primary">Book Now — It's Free!</Link>
            <Link to="/about" className="btn-hero-outline">Learn More</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

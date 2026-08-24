import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How can I book a water can?',
    a: 'Visit the Book Water page, enter your name and mobile number, select how many cans you need, and click "Book Water Can". That\'s it! You\'ll receive a confirmation immediately.'
  },
  {
    q: 'Can I book by phone?',
    a: 'Yes! Call us at 9345038836 and our owner will manually add your order in the system. These are tracked as "Offline" orders.'
  },
  {
    q: 'Can I pay later?',
    a: 'Absolutely. Our system supports flexible payments — you can pay in full, partially, or later. The owner tracks all payment statuses.'
  },
  {
    q: 'Can I return empty cans later?',
    a: 'Yes. Empty can returns are tracked separately per order. You can return them at your convenience and the owner will update the system.'
  },
  {
    q: 'How do I check my previous orders?',
    a: 'Contact the owner or share your mobile number with them. They can search your history and show you all past orders, payments, and balances.'
  },
  {
    q: 'What is the price per water can?',
    a: 'The current price is ₹20 per can. The owner can update pricing from the system settings. Your past orders always reflect the price at the time of booking.'
  },
  {
    q: 'What if I order the wrong quantity?',
    a: 'Call us immediately at 9345038836. The owner can modify your order before delivery.'
  },
  {
    q: 'How do I get my balance cleared?',
    a: 'Hand over the payment amount to the delivery person or directly to the owner. They will record the payment in the system and your balance will be updated.'
  },
];

const Help = () => {
  const [open, setOpen] = useState(null);

  return (
    <>
      <div className="about-hero">
        <div className="container py-4">
          <span className="section-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>❓ Support</span>
          <h1 className="hero-title mt-2" style={{ fontSize: '2.5rem' }}>Help & FAQ</h1>
          <p className="hero-subtitle mx-auto" style={{ maxWidth: 500 }}>
            Find answers to common questions or reach us directly.
          </p>
        </div>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <span className="section-badge">📋 Frequently Asked Questions</span>
              <h2 className="section-title mt-2 mb-4">Common Questions</h2>

              <div className="accordion-wc">
                {faqs.map((faq, i) => (
                  <div key={i} className="accordion-item-wc">
                    <button
                      className="accordion-btn"
                      onClick={() => setOpen(open === i ? null : i)}
                    >
                      <span>❓ {faq.q}</span>
                      <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                        {open === i ? '−' : '+'}
                      </span>
                    </button>
                    {open === i && (
                      <div className="accordion-content">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="about-card mb-3">
                <h5 style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>📞 Contact Us Directly</h5>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 2 }}>
                  <div>📱 <strong>9345038836</strong></div>
                  <div>🕒 Available: 7 AM – 8 PM</div>
                  <div>🏠 Laligam bus stop, Laligam, Dharmapuri 636804</div>
                </div>
                <div className="mt-3 p-3" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  💡 For urgent orders, call directly. The owner can add your order over the phone.
                </div>
              </div>

              <div className="about-card">
                <h5 style={{ fontWeight: 700, color: 'var(--primary-dark)', marginBottom: '1rem' }}>⚡ Quick Actions</h5>
                <Link to="/book" className="btn-primary-wc d-block text-center mb-2">💧 Book Water Now</Link>
                <Link to="/about" className="btn-wc btn-wc-outline d-block text-center">ℹ️ Learn About Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Help;

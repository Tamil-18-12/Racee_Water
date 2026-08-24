import React, { useState, useEffect } from 'react';
import { createPublicOrder } from '../api/orderApi';
import { getPublicSettings } from '../api/settingsApi';
import { FaWater, FaCheck, FaWhatsapp } from 'react-icons/fa';

const BookWater = () => {
  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    address: '',
    numberOfCans: 1,
    notes: '',
    customCans: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [pricePerCan, setPricePerCan] = useState(20);
  const [selectedPreset, setSelectedPreset] = useState(1);

  useEffect(() => {
    getPublicSettings()
      .then(r => setPricePerCan(r.data?.data?.pricePerCan || 20))
      .catch(() => {});
  }, []);

  const presets = [1, 2, 3, 4, 5, 6];

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Please enter a valid 10-digit Indian mobile number';
    if (!form.numberOfCans || form.numberOfCans < 1) e.numberOfCans = 'At least 1 can is required';
    return e;
  };

  const handlePreset = (n) => {
    setSelectedPreset(n);
    setForm(f => ({ ...f, numberOfCans: n, customCans: '' }));
    setErrors(e => ({ ...e, numberOfCans: undefined }));
  };

  const handleMoreCans = (val) => {
    setSelectedPreset('more');
    const n = parseInt(val) || 1;
    setForm(f => ({ ...f, numberOfCans: n, customCans: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        numberOfCans: form.numberOfCans,
        amountPaid: 0,
        emptyCansReturned: 0,
        orderSource: 'ONLINE',
        orderStatus: 'PENDING',
        notes: form.notes.trim(),
      };
      const res = await createPublicOrder(payload);
      setSuccess(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="booking-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="success-card">
                <div className="success-icon">🎉</div>
                <h3 style={{ color: '#065f46', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Order Placed Successfully!
                </h3>
                <p style={{ color: '#047857' }}>Your water can order has been successfully placed.</p>

                <div className="mt-3 text-start" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '1.25rem' }}>
                  {[
                    ['📋 Order ID', success.orderId],
                    ['👤 Customer Name', success.customerName],
                    ['📱 Mobile', success.mobile],
                    ['💧 Number of Cans', `${success.numberOfCans} can${success.numberOfCans > 1 ? 's' : ''}`],
                    ['💰 Total Amount', `₹${success.totalAmount}`],
                    ['📊 Status', 'Pending'],
                    ['🕒 Booked At', success.createdAt ? new Date(success.createdAt).toLocaleString('en-IN') : 'Just now'],
                  ].map(([label, val]) => (
                    <div key={label} className="amount-row">
                      <span className="amount-label">{label}</span>
                      <span className="amount-value">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3" style={{ background: '#f0fff4', borderRadius: '10px', fontSize: '0.9rem', color: '#047857' }}>
                  <FaCheck /> Our team will contact you soon to confirm delivery.
                </div>

                <a
                  href={`https://wa.me/919345038836?text=${encodeURIComponent(
                    `Hello Racee Water, I have placed an online order (#${success.orderId}) for ${success.numberOfCans} can(s). Name: ${success.customerName}, Mobile: ${success.mobile}. Please confirm my delivery.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wc mt-3 w-100 d-inline-flex align-items-center justify-content-center gap-2"
                  style={{
                    background: '#25D366',
                    borderColor: '#25D366',
                    color: '#fff',
                    fontWeight: 700,
                    padding: '0.75rem',
                    textDecoration: 'none',
                    borderRadius: '10px',
                  }}
                >
                  <FaWhatsapp size={18} /> Chat with us on WhatsApp
                </a>

                <button
                  onClick={() => { setSuccess(null); setForm({ customerName: '', mobile: '', address: '', numberOfCans: 1, notes: '', customCans: '' }); setSelectedPreset(1); }}
                  className="btn-primary-wc mt-3"
                >
                  💧 Place Another Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-xl-6">
            <div className="text-center mb-4">
              <span className="section-badge">💧 Online Booking</span>
              <h1 className="booking-title mt-2">Book Water Can</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Fill in your details and we'll deliver fresh water to your door</p>
            </div>

            <div className="booking-card">
              {errors.submit && <div className="alert-wc alert-danger">{errors.submit}</div>}

              <form onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">👤 Customer Name *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.customerName ? 'is-invalid' : ''}`}
                    placeholder="Enter your full name"
                    value={form.customerName}
                    onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  />
                  {errors.customerName && <div className="invalid-feedback">{errors.customerName}</div>}
                </div>

                {/* Mobile */}
                <div className="mb-3">
                  <label className="form-label">📱 Mobile Number *</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.mobile ? 'is-invalid' : ''}`}
                    placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                    maxLength={10}
                    value={form.mobile}
                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                  />
                  {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label className="form-label">📍 Delivery Address</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your delivery address / landmark"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>

                {/* Number of cans */}
                <div className="mb-3">
                  <label className="form-label">💧 Number of Water Cans *</label>
                  <div className="can-selector">
                    {presets.map(n => (
                      <button
                        key={n}
                        type="button"
                        className={`can-btn ${selectedPreset === n ? 'active' : ''}`}
                        onClick={() => handlePreset(n)}
                      >{n}</button>
                    ))}
                    <button
                      type="button"
                      className={`can-btn ${selectedPreset === 'more' ? 'active' : ''}`}
                      style={{ fontSize: '0.8rem', width: '64px' }}
                      onClick={() => setSelectedPreset('more')}
                    >More</button>
                  </div>
                  {selectedPreset === 'more' && (
                    <input
                      type="number"
                      className="form-control mt-2"
                      placeholder="Enter custom quantity"
                      min={7}
                      max={100}
                      value={form.customCans}
                      onChange={e => handleMoreCans(e.target.value)}
                    />
                  )}
                  {errors.numberOfCans && <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{errors.numberOfCans}</div>}
                </div>

                {/* Price preview */}
                <div className="mb-3 p-3" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="amount-row">
                    <span className="amount-label">💧 Cans selected</span>
                    <span className="amount-value">{form.numberOfCans} can{form.numberOfCans > 1 ? 's' : ''}</span>
                  </div>
                  <div className="amount-row">
                    <span className="amount-label">💰 Price per can</span>
                    <span className="amount-value">₹{pricePerCan}</span>
                  </div>
                  <div className="amount-row" style={{ borderBottom: 'none' }}>
                    <span className="amount-label" style={{ fontWeight: 700 }}>💵 Estimated Total</span>
                    <span className="amount-value" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>₹{(form.numberOfCans * pricePerCan).toFixed(0)}</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-4">
                  <label className="form-label">📝 Additional Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Any special instructions or notes..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn-primary-wc" disabled={loading}>
                  {loading ? '⏳ Placing Order...' : '💧 Book Water Can'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookWater;

import React, { useState } from 'react';
import { createCustomer } from '../../../api/customerApi';
import { getWhatsAppWelcomeUrl, openWhatsApp } from '../../../utils/whatsappUtils';
import { FaWhatsapp, FaUserPlus, FaCheckCircle, FaShoppingCart, FaUser, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';

const AddCustomerModal = ({ onClose, onSuccess, onAddOrderForCustomer }) => {
  const [form, setForm] = useState({ name: '', mobile: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCustomer, setCreatedCustomer] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) {
      setError('Customer name and mobile number are required');
      return;
    }
    const cleanMobile = form.mobile.trim().replace(/[^0-9]/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await createCustomer({
        name: form.name.trim(),
        mobile: cleanMobile,
        address: form.address.trim(),
      });
      const customer = res.data.data;
      setCreatedCustomer(customer);
      if (onSuccess) onSuccess(customer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!createdCustomer) return;
    const url = getWhatsAppWelcomeUrl(createdCustomer);
    openWhatsApp(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-box"
        style={{
          maxWidth: 480,
          width: '95%',
          padding: 0,
          overflow: 'hidden',
          borderRadius: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #0077b6 0%, #023e8a 100%)',
            color: '#fff',
            padding: '1rem 1.25rem',
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.3rem' }}><FaUserPlus /></span>
            <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>
              {createdCustomer ? 'Customer Registered' : 'Add New Customer'}
            </h5>
          </div>
          <button className="modal-close" style={{ color: '#fff', opacity: 0.9 }} onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {error && <div className="alert-wc alert-danger mb-3">{error}</div>}

          {!createdCustomer ? (
            /* Creation Form */
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold" style={{ fontSize: '0.9rem', color: '#03045e' }}>
                  <FaUser style={{ marginRight: 6, color: '#0077b6' }} /> Customer Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold" style={{ fontSize: '0.9rem', color: '#03045e' }}>
                  <FaPhoneAlt style={{ marginRight: 6, color: '#0077b6' }} /> Mobile Number *
                </label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: '#f0f9ff', fontWeight: 600, color: '#0077b6' }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold" style={{ fontSize: '0.9rem', color: '#03045e' }}>
                  <FaMapMarkerAlt style={{ marginRight: 6, color: '#0077b6' }} /> Delivery Address (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Door No, Street Name, Landmark..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end pt-2 border-top">
                <button type="button" className="btn-wc btn-wc-outline" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-wc btn-wc-primary fw-bold" disabled={loading}>
                  {loading ? 'Adding Customer...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          ) : (
            /* Success & WhatsApp Message Options */
            <div className="text-center">
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 1rem',
                }}
              >
                <FaCheckCircle />
              </div>

              <h4 className="fw-bold" style={{ color: '#065f46', marginBottom: '0.25rem' }}>
                Customer Added!
              </h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                {createdCustomer.name} has been added to the customer database.
              </p>

              {/* Customer summary box */}
              <div
                className="text-start p-3 my-3"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                }}
              >
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Customer Name:</span>
                  <span className="fw-bold">{createdCustomer.name}</span>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span className="text-muted">Mobile Number:</span>
                  <span className="fw-bold">📱 {createdCustomer.mobile}</span>
                </div>
                {createdCustomer.address && (
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Address:</span>
                    <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>{createdCustomer.address}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-column gap-2 mt-3">
                <button
                  type="button"
                  className="btn-wc fw-bold py-2"
                  style={{
                    background: '#25D366',
                    borderColor: '#25D366',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                  }}
                  onClick={handleSendWhatsApp}
                >
                  <FaWhatsapp size={20} /> Send Welcome Message on WhatsApp
                </button>

                {onAddOrderForCustomer && (
                  <button
                    type="button"
                    className="btn-wc btn-wc-primary py-2 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      onClose();
                      onAddOrderForCustomer(createdCustomer);
                    }}
                  >
                    <FaShoppingCart /> Create First Order For Customer
                  </button>
                )}

                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn-wc btn-wc-outline flex-fill"
                    onClick={() => {
                      setCreatedCustomer(null);
                      setForm({ name: '', mobile: '', address: '' });
                    }}
                  >
                    ➕ Add Another
                  </button>
                  <button
                    type="button"
                    className="btn-wc btn-wc-secondary flex-fill"
                    onClick={onClose}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;

import React, { useState } from 'react';
import { addPayment } from '../../../api/orderApi';

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const remaining = order.balanceAmount;
  const [amount, setAmount] = useState(remaining > 0 ? String(remaining) : '');
  const [paymentMode, setPaymentMode] = useState(order.paymentMode === 'ONLINE' ? 'ONLINE' : 'CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const newPaid = parseFloat(amount) || 0;
  const newBalance = remaining - newPaid;

  const handleSubmit = async (e, modeOverride, amtOverride) => {
    if (e) e.preventDefault();
    const mode = modeOverride || paymentMode;
    const amt = amtOverride !== undefined ? parseFloat(amtOverride) : parseFloat(amount);

    if (!amt || amt <= 0) { setError('Please enter a valid payment amount'); return; }
    if (amt > remaining) { setError(`Payment ₹${amt} exceeds balance ₹${remaining}`); return; }

    setLoading(true);
    try {
      await addPayment(order.id, { amount: amt, paymentMode: mode });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to record payment');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>💰 Record Payment</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert-wc alert-danger">{error}</div>}

          <div className="mb-3 p-3" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Order: {order.orderId}</div>
            <div className="amount-row"><span className="amount-label">Customer</span><span className="amount-value">{order.customerName}</span></div>
            <div className="amount-row"><span className="amount-label">Order Total</span><span className="amount-value">₹{order.totalAmount}</span></div>
            <div className="amount-row"><span className="amount-label">Already Paid</span><span className="amount-value green">₹{order.amountPaid}</span></div>
            <div className="amount-row"><span className="amount-label">Balance Due</span><span className="amount-value red">₹{remaining}</span></div>
          </div>

          {remaining <= 0 ? (
            <div className="alert-wc alert-success text-center">
              🎉 This order is already fully paid! (₹{order.totalAmount})
            </div>
          ) : (
            <form onSubmit={e => handleSubmit(e)}>
              {/* Payment Mode Selection */}
              <div className="mb-3">
                <label className="form-label fw-bold">💳 Payment Method / Mode *</label>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className={`btn-wc flex-fill ${paymentMode === 'CASH' ? 'btn-wc-success' : 'btn-wc-outline'}`}
                    onClick={() => setPaymentMode('CASH')}
                    style={{ justifyContent: 'center' }}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    className={`btn-wc flex-fill ${paymentMode === 'ONLINE' ? 'btn-wc-primary' : 'btn-wc-outline'}`}
                    onClick={() => setPaymentMode('ONLINE')}
                    style={{ justifyContent: 'center' }}
                  >
                    📱 Online / UPI
                  </button>
                </div>
              </div>

              {/* Quick Pay Buttons */}
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem' }}>⚡ Quick 1-Click Pay</label>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn-wc btn-wc-sm btn-wc-success flex-fill"
                    disabled={loading}
                    onClick={() => handleSubmit(null, 'CASH', remaining)}
                  >
                    💵 Pay Full (₹{remaining}) in Cash
                  </button>
                  <button
                    type="button"
                    className="btn-wc btn-wc-sm btn-wc-primary flex-fill"
                    disabled={loading}
                    onClick={() => handleSubmit(null, 'ONLINE', remaining)}
                  >
                    📱 Pay Full (₹{remaining}) Online
                  </button>
                </div>
              </div>

              {/* Custom Amount */}
              <div className="mb-3">
                <label className="form-label">💵 Custom Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Max ₹${remaining}`}
                  min={0.01}
                  max={remaining}
                  step={0.01}
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                />
                <div className="d-flex gap-2 mt-2">
                  <button type="button" className="chip" onClick={() => setAmount(String(remaining))}>Full (₹{remaining})</button>
                  {remaining > 1 && (
                    <button type="button" className="chip" onClick={() => setAmount(String(Math.floor(remaining / 2)))}>Half (₹{Math.floor(remaining / 2)})</button>
                  )}
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="mb-3 p-3" style={{ background: '#f0fff4', borderRadius: 'var(--radius-sm)' }}>
                  <div className="amount-row"><span className="amount-label">Paying Now</span><span className="amount-value green">₹{newPaid} via {paymentMode}</span></div>
                  <div className="amount-row"><span className="amount-label">New Balance</span>
                    <span className={`amount-value ${newBalance <= 0 ? 'green' : 'red'}`}>₹{Math.max(0, newBalance).toFixed(0)}</span>
                  </div>
                  <div className="amount-row" style={{ borderBottom: 'none' }}>
                    <span className="amount-label">Updated Status</span>
                    <span className="amount-value">{newBalance <= 0.01 ? '✅ FULLY PAID' : '⚠️ PARTIAL'}</span>
                  </div>
                </div>
              )}

              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} className="btn-wc btn-wc-outline">Cancel</button>
                <button type="submit" className="btn-wc btn-wc-success" disabled={loading}>
                  {loading ? 'Recording...' : `💰 Save ₹${newPaid || 0} (${paymentMode})`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

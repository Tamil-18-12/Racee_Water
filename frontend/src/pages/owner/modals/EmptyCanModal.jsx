import React, { useState } from 'react';
import { addEmptyCanReturn } from '../../../api/orderApi';

const EmptyCanModal = ({ order, onClose, onSuccess }) => {
  const pending = order.emptyCansPending;
  const [cans, setCans] = useState(pending > 0 ? String(pending) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const newReturned = parseInt(cans) || 0;
  const newPending = pending - newReturned;

  const handleSubmit = async (e, directCans) => {
    if (e) e.preventDefault();
    const n = directCans !== undefined ? parseInt(directCans) : parseInt(cans);
    if (!n || n <= 0) { setError('Enter a valid number of cans'); return; }
    if (n > pending) { setError(`Cannot return more than pending (${pending} cans)`); return; }
    setLoading(true);
    try {
      await addEmptyCanReturn(order.id, { returnedCans: n });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to record return');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>♻️ Empty Can Return</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert-wc alert-danger">{error}</div>}

          <div className="mb-3 p-3" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Order: {order.orderId}</div>
            <div className="amount-row"><span className="amount-label">Customer</span><span className="amount-value">{order.customerName}</span></div>
            <div className="amount-row"><span className="amount-label">Cans Delivered</span><span className="amount-value">💧 {order.emptyCansDelivered}</span></div>
            <div className="amount-row"><span className="amount-label">Already Returned</span><span className="amount-value green">♻️ {order.emptyCansReturned}</span></div>
            <div className="amount-row"><span className="amount-label">Cans Pending Return</span><span className="amount-value" style={{ color: pending > 0 ? 'var(--warning)' : 'var(--success)' }}>⏳ {pending}</span></div>
          </div>

          {pending === 0 ? (
            <div className="alert-wc alert-success text-center">
              🎉 All empty cans ({order.emptyCansDelivered}/{order.emptyCansDelivered}) have been returned!
            </div>
          ) : (
            <form onSubmit={e => handleSubmit(e)}>
              {/* Quick 1-Click Return All */}
              <div className="mb-3">
                <button
                  type="button"
                  className="btn-wc btn-wc-warning w-100"
                  style={{ justifyContent: 'center', padding: '0.6rem' }}
                  disabled={loading}
                  onClick={() => handleSubmit(null, pending)}
                >
                  ⚡ Return All {pending} Pending Cans Now
                </button>
              </div>

              <div className="mb-3">
                <label className="form-label">♻️ Or Return Specific Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Max ${pending}`}
                  min={1}
                  max={pending}
                  value={cans}
                  onChange={e => { setCans(e.target.value); setError(''); }}
                  autoFocus
                />
                <div className="d-flex gap-2 mt-2">
                  <button type="button" className="chip" onClick={() => setCans(String(pending))}>All ({pending})</button>
                  {pending > 1 && <button type="button" className="chip" onClick={() => setCans('1')}>1 Can</button>}
                  {pending > 2 && <button type="button" className="chip" onClick={() => setCans('2')}>2 Cans</button>}
                </div>
              </div>

              {cans && parseInt(cans) > 0 && parseInt(cans) <= pending && (
                <div className="mb-3 p-3" style={{ background: '#f0fff4', borderRadius: 'var(--radius-sm)' }}>
                  <div className="amount-row"><span className="amount-label">Returning Now</span><span className="amount-value green">♻️ {newReturned} Cans</span></div>
                  <div className="amount-row"><span className="amount-label">Pending After Return</span>
                    <span className="amount-value" style={{ color: newPending <= 0 ? 'var(--success)' : 'var(--warning)' }}>
                      {newPending <= 0 ? '✅ 0 (All Returned)' : `⏳ ${newPending} Pending`}
                    </span>
                  </div>
                </div>
              )}

              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} className="btn-wc btn-wc-outline">Cancel</button>
                <button type="submit" className="btn-wc btn-wc-warning" disabled={loading}>
                  {loading ? 'Recording...' : `♻️ Record Return (${newReturned || 0} Cans)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyCanModal;

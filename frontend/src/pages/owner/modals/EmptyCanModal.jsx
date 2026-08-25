import React, { useState } from 'react';
import { addEmptyCanReturn } from '../../../api/orderApi';

const EmptyCanModal = ({ order, onClose, onSuccess }) => {
  const pending = order.emptyCansPending;
  const assignedCans = Array.isArray(order.canNumbers) ? order.canNumbers.map(Number) : [];
  const alreadyReturned = Array.isArray(order.returnedCanNumbers) ? order.returnedCanNumbers.map(Number) : [];
  const pendingCanNumbers = assignedCans.filter(n => !alreadyReturned.includes(n));

  const [selectedReturningNums, setSelectedReturningNums] = useState(pendingCanNumbers);
  const [cans, setCans] = useState(pending > 0 ? String(pending) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleReturningNum = (num) => {
    if (selectedReturningNums.includes(num)) {
      const updated = selectedReturningNums.filter(n => n !== num);
      setSelectedReturningNums(updated);
      setCans(String(updated.length));
    } else {
      const updated = [...selectedReturningNums, num];
      setSelectedReturningNums(updated);
      setCans(String(updated.length));
    }
  };

  const handleSelectAllCans = () => {
    setSelectedReturningNums(pendingCanNumbers);
    setCans(String(pendingCanNumbers.length));
  };

  const handleSubmit = async (e, directReturnAll) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (directReturnAll) {
        await addEmptyCanReturn(order.id, {
          returnedCanNumbers: [...alreadyReturned, ...pendingCanNumbers],
          returnedCans: pending,
        });
      } else if (assignedCans.length > 0) {
        if (selectedReturningNums.length === 0) {
          setError('Please select at least 1 can number to return');
          setLoading(false);
          return;
        }
        await addEmptyCanReturn(order.id, {
          returnedCanNumbers: [...alreadyReturned, ...selectedReturningNums],
        });
      } else {
        const n = parseInt(cans, 10);
        if (!n || n <= 0) { setError('Enter a valid number of cans'); setLoading(false); return; }
        if (n > pending) { setError(`Cannot return more than pending (${pending} cans)`); setLoading(false); return; }
        await addEmptyCanReturn(order.id, { returnedCans: n });
      }
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to record return');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>♻️ Empty Can Return (Unblock Cans)</h5>
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
              🎉 All empty cans ({order.emptyCansDelivered}/{order.emptyCansDelivered}) have been returned and unblocked!
            </div>
          ) : (
            <form onSubmit={e => handleSubmit(e)}>
              {/* Numbered Cans Return Selection */}
              {assignedCans.length > 0 ? (
                <div className="mb-3 p-3" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                      🛢️ Select Returning Can Numbers to Unblock:
                    </label>
                    <button type="button" className="btn-wc btn-wc-sm btn-wc-outline" onClick={handleSelectAllCans} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}>
                      Select All Pending ({pendingCanNumbers.length})
                    </button>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {assignedCans.map(num => {
                      const isAlreadyReturned = alreadyReturned.includes(num);
                      const isSelectedToReturn = selectedReturningNums.includes(num);

                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isAlreadyReturned}
                          onClick={() => toggleReturningNum(num)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: isAlreadyReturned ? '1px solid #86efac' : isSelectedToReturn ? '2px solid #16a34a' : '1px solid #cbd5e1',
                            background: isAlreadyReturned ? '#dcfce7' : isSelectedToReturn ? '#22c55e' : '#ffffff',
                            color: isAlreadyReturned ? '#166534' : isSelectedToReturn ? '#ffffff' : '#334155',
                            cursor: isAlreadyReturned ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isAlreadyReturned ? `✅ Can #${num}` : isSelectedToReturn ? `♻️ Return #${num}` : `⏳ Can #${num}`}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    ℹ️ Selected green cans will be recorded as returned and automatically <strong>unblocked</strong> in inventory.
                  </div>
                </div>
              ) : (
                /* Fallback quantity input if order has no specific numbered cans */
                <div className="mb-3">
                  <label className="form-label">♻️ Return Quantity</label>
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
                  </div>
                </div>
              )}

              {/* Quick 1-Click Return All */}
              <div className="mb-3">
                <button
                  type="button"
                  className="btn-wc btn-wc-warning w-100"
                  style={{ justifyContent: 'center', padding: '0.6rem', fontWeight: 600 }}
                  disabled={loading}
                  onClick={() => handleSubmit(null, true)}
                >
                  ⚡ Return All {pending} Pending Cans Now
                </button>
              </div>

              <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} className="btn-wc btn-wc-outline">Cancel</button>
                <button type="submit" className="btn-wc btn-wc-success" disabled={loading}>
                  {loading ? 'Recording...' : `♻️ Record Return & Unblock Cans`}
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

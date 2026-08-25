import React, { useState, useEffect } from 'react';
import { getCanStatus, updateOrderStatus } from '../../../api/orderApi';

const AssignCansModal = ({ order, targetStatus, onClose, onSuccess }) => {
  const [canStatus, setCanStatus] = useState(null);
  const [selectedCanNumbers, setSelectedCanNumbers] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requiredCount = order.numberOfCans || 1;

  const updateSelection = (nums) => {
    setSelectedCanNumbers(nums);
    setManualInput(nums.join(', '));
  };

  useEffect(() => {
    getCanStatus()
      .then((res) => {
        const data = res.data.data;
        setCanStatus(data);
        const initial = Array.isArray(order.canNumbers) && order.canNumbers.length > 0
          ? order.canNumbers.map(Number)
          : (data?.availableNumbers || []).slice(0, requiredCount);
        updateSelection(initial);
      })
      .catch(() => setError('Failed to load available can stock'));
  }, [order]);

  const parseText = (text) => {
    const nums = [];
    const parts = text.split(/[,;\s]+/);
    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [s, e] = part.split('-');
        const start = parseInt(s, 10);
        const end = parseInt(e, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) nums.push(i);
        }
      } else {
        const val = parseInt(part, 10);
        if (!isNaN(val)) nums.push(val);
      }
    }
    return Array.from(new Set(nums)).sort((a, b) => a - b);
  };

  const handleTextChange = (val) => {
    setManualInput(val);
    const parsed = parseText(val);
    if (parsed.length > 0) {
      setSelectedCanNumbers(parsed);
    }
  };

  const toggleCan = (num) => {
    if (canStatus?.blockedMap?.[num] && String(canStatus.blockedMap[num].orderId) !== String(order.orderId)) {
      return; // Blocked by another order
    }
    let newSelection;
    if (selectedCanNumbers.includes(num)) {
      newSelection = selectedCanNumbers.filter((x) => x !== num);
    } else {
      if (selectedCanNumbers.length >= requiredCount) {
        newSelection = [...selectedCanNumbers.slice(1), num];
      } else {
        newSelection = [...selectedCanNumbers, num];
      }
    }
    updateSelection(newSelection);
  };

  const handleAutoSelect = () => {
    if (canStatus?.availableNumbers) {
      updateSelection(canStatus.availableNumbers.slice(0, requiredCount));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (selectedCanNumbers.length !== requiredCount) {
      setError(`Please select or enter exactly ${requiredCount} available can number(s) (currently ${selectedCanNumbers.length})`);
      return;
    }
    setLoading(true);
    try {
      await updateOrderStatus(order.id, targetStatus, selectedCanNumbers);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1300 }}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5>🚚 Select Can Numbers for Delivery ({targetStatus.replace(/_/g, ' ')})</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert-wc alert-danger">{error}</div>}

          <div className="mb-3 p-3" style={{ background: '#f0f9ff', borderRadius: '8px' }}>
            <div style={{ fontWeight: 700 }}>Order ID: {order.orderId}</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Customer: <strong>{order.customerName}</strong> ({order.mobile})
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Cans Ordered: <strong>💧 {requiredCount} Cans</strong>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="mb-3 p-3" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                  🛢️ Choose or Type Can Numbers ({selectedCanNumbers.length}/{requiredCount}):
                </label>
                <button type="button" className="btn-wc btn-wc-sm btn-wc-outline" onClick={handleAutoSelect} style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}>
                  ⚡ Auto-Select Available
                </button>
              </div>

              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter e.g. 1, 2, 5 or 1-5..."
                  value={manualInput}
                  onChange={(e) => handleTextChange(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  💡 Manually enter can numbers or pick below. Blocked cans are disabled.
                </div>
              </div>

              {canStatus ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '4px' }}>
                  {Array.from({ length: canStatus.totalCansCount || 50 }, (_, i) => i + 1).map((num) => {
                    const isBlocked = Boolean(canStatus.blockedMap?.[num]) && String(canStatus.blockedMap[num].orderId) !== String(order.orderId);
                    const isSelected = selectedCanNumbers.includes(num);
                    const blockInfo = canStatus.blockedMap?.[num];

                    return (
                      <button
                        key={num}
                        type="button"
                        disabled={isBlocked}
                        onClick={() => toggleCan(num)}
                        title={isBlocked ? `Can #${num} is BLOCKED (Out with ${blockInfo?.customerName})` : `Can #${num}`}
                        style={{
                          padding: '0.4rem 0.2rem',
                          fontSize: '0.82rem',
                          fontWeight: isSelected || isBlocked ? 700 : 500,
                          borderRadius: '6px',
                          border: isSelected ? '2px solid #0284c7' : isBlocked ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                          background: isSelected ? '#0284c7' : isBlocked ? '#fee2e2' : '#ffffff',
                          color: isSelected ? '#ffffff' : isBlocked ? '#991b1b' : '#334155',
                          cursor: isBlocked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isBlocked ? `🔒#${num}` : `#${num}`}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading can stock...</div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1rem' }}>
              <button type="button" onClick={onClose} className="btn-wc btn-wc-outline">Cancel</button>
              <button type="submit" className="btn-wc btn-wc-primary" disabled={loading}>
                {loading ? 'Saving...' : `🚚 Assign Cans & Set Status to ${targetStatus.replace(/_/g, ' ')}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignCansModal;

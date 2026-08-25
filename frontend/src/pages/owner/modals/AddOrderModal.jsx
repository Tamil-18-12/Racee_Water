import React, { useState, useEffect } from 'react';
import { searchCustomers, getCustomerByMobile, createCustomer } from '../../../api/customerApi';
import { createOrderForCustomer, getCanStatus } from '../../../api/orderApi';
import { getPublicSettings } from '../../../api/settingsApi';

const AddOrderModal = ({ onClose, onSuccess, preselectedCustomer = null }) => {
  const [step, setStep] = useState(preselectedCustomer ? 'order' : 'search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer);
  const [pricePerCan, setPricePerCan] = useState(20);
  const [canStatus, setCanStatus] = useState(null);
  const [selectedCanNumbers, setSelectedCanNumbers] = useState([]);
  const [manualCanInput, setManualCanInput] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', address: '' });
  const [orderForm, setOrderForm] = useState({
    numberOfCans: 1,
    amountPaid: 0,
    paymentMode: 'CASH',
    emptyCansReturned: 0,
    orderSource: 'OFFLINE',
    orderStatus: 'DELIVERED',
    notes: '',
  });

  const updateSelectedCans = (newSelection) => {
    setSelectedCanNumbers(newSelection);
    setManualCanInput(newSelection.join(', '));
  };

  useEffect(() => {
    getPublicSettings().then(r => setPricePerCan(r.data?.data?.pricePerCan || 20)).catch(() => {});
    getCanStatus()
      .then(res => {
        const data = res.data.data;
        setCanStatus(data);
        if (data?.availableNumbers?.length > 0) {
          updateSelectedCans(data.availableNumbers.slice(0, 1));
        }
      })
      .catch(() => {});
  }, []);

  const parseCanInputText = (text) => {
    const nums = [];
    const parts = text.split(/[,;\s]+/);
    for (const part of parts) {
      if (!part) continue;
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
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

  const handleManualInputChange = (val) => {
    setManualCanInput(val);
    const parsed = parseCanInputText(val);
    if (parsed.length > 0) {
      setSelectedCanNumbers(parsed);
      setOrderForm(f => ({ ...f, numberOfCans: parsed.length }));
    }
  };

  const handleCansCountChange = (count) => {
    const n = Math.max(1, parseInt(count) || 1);
    setOrderForm(f => ({ ...f, numberOfCans: n }));
    if (canStatus?.availableNumbers) {
      const currentValid = selectedCanNumbers.filter(num => !canStatus.blockedMap?.[num]);
      if (currentValid.length >= n) {
        updateSelectedCans(currentValid.slice(0, n));
      } else {
        const remainingNeeded = n - currentValid.length;
        const additional = canStatus.availableNumbers
          .filter(num => !currentValid.includes(num))
          .slice(0, remainingNeeded);
        updateSelectedCans([...currentValid, ...additional]);
      }
    }
  };

  const toggleCanSelection = (num) => {
    if (canStatus?.blockedMap?.[num]) return; // Blocked
    let newSelection;
    if (selectedCanNumbers.includes(num)) {
      newSelection = selectedCanNumbers.filter(x => x !== num);
    } else {
      if (selectedCanNumbers.length >= orderForm.numberOfCans) {
        newSelection = [...selectedCanNumbers.slice(1), num];
      } else {
        newSelection = [...selectedCanNumbers, num];
      }
    }
    updateSelectedCans(newSelection);
  };

  const handleAutoSelect = () => {
    if (canStatus?.availableNumbers) {
      updateSelectedCans(canStatus.availableNumbers.slice(0, orderForm.numberOfCans));
    }
  };

  const totalAmount = orderForm.numberOfCans * pricePerCan;
  const balance = totalAmount - orderForm.amountPaid;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await searchCustomers(searchQuery.trim());
      setSearchResults(res.data.data || []);
    } catch { setError('Search failed'); }
    finally { setLoading(false); }
  };

  const handleSelectCustomer = (c) => {
    setSelectedCustomer(c);
    setStep('order');
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.mobile) { setError('Name and mobile are required'); return; }
    if (!/^[6-9]\d{9}$/.test(newCustomer.mobile)) { setError('Please enter a valid 10-digit Indian mobile number'); return; }
    setLoading(true);
    try {
      const res = await createCustomer(newCustomer);
      setSelectedCustomer(res.data.data);
      setStep('order');
      setError('');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create customer');
    } finally { setLoading(false); }
  };

  const handlePlaceOrder = async () => {
    if (orderForm.numberOfCans < 1) { setError('At least 1 can required'); return; }
    if (selectedCanNumbers.length !== orderForm.numberOfCans) {
      setError(`Please select exactly ${orderForm.numberOfCans} available can number(s) (currently selected: ${selectedCanNumbers.length})`);
      return;
    }
    if (orderForm.amountPaid < 0) { setError('Payment cannot be negative'); return; }
    if (orderForm.amountPaid > totalAmount) { setError(`Payment cannot exceed total ₹${totalAmount}`); return; }
    if (orderForm.emptyCansReturned > orderForm.numberOfCans) { setError('Empty cans returned cannot exceed cans ordered'); return; }
    setLoading(true);
    try {
      await createOrderForCustomer(selectedCustomer.id, {
        ...orderForm,
        numberOfCans: parseInt(orderForm.numberOfCans),
        canNumbers: selectedCanNumbers,
        amountPaid: parseFloat(orderForm.amountPaid) || 0,
        emptyCansReturned: parseInt(orderForm.emptyCansReturned) || 0,
      });
      onSuccess();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create order');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h5>➕ Add Order</h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert-wc alert-danger">{error}</div>}

          {/* Step: Search Customer */}
          {step === 'search' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Search by customer name or mobile number, or add a new customer.
              </p>
              <div className="d-flex gap-2 mb-3">
                <input type="text" className="form-control" placeholder="Search name or mobile..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                <button onClick={handleSearch} className="btn-wc btn-wc-primary" disabled={loading}>
                  {loading ? '...' : '🔍'}
                </button>
              </div>

              {searchResults.map(c => (
                <div key={c.id} onClick={() => handleSelectCustomer(c)}
                  style={{ padding: '0.85rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: '0.5rem', background: '#fafeff', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📱 {c.mobile} • Orders: {c.totalOrders} • Pending: ₹{c.totalPending?.toFixed(0)}</div>
                </div>
              ))}

              <div className="text-center mt-3">
                <button onClick={() => setStep('new')} className="btn-wc btn-wc-outline">
                  ➕ New Customer
                </button>
              </div>
            </div>
          )}

          {/* Step: New Customer */}
          {step === 'new' && (
            <div>
              <h6 className="fw-bold mb-3">👤 New Customer Details</h6>
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input type="text" className="form-control" value={newCustomer.name}
                  onChange={e => setNewCustomer(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Mobile Number *</label>
                <input type="tel" className="form-control" maxLength={10} value={newCustomer.mobile}
                  onChange={e => setNewCustomer(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))} />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <input type="text" className="form-control" value={newCustomer.address}
                  onChange={e => setNewCustomer(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="d-flex gap-2">
                <button onClick={() => setStep('search')} className="btn-wc btn-wc-outline flex-fill">← Back</button>
                <button onClick={handleCreateCustomer} className="btn-wc btn-wc-primary flex-fill" disabled={loading}>
                  {loading ? 'Creating...' : '✅ Create & Add Order'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Order Form */}
          {step === 'order' && selectedCustomer && (
            <div>
              <div className="mb-3 p-3 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>👤 {selectedCustomer.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📱 {selectedCustomer.mobile}</div>
                </div>
                {selectedCustomer.mobile && (
                  <a
                    href={`https://wa.me/91${selectedCustomer.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedCustomer.name}, greeting from Racee Water! 💧`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wc btn-wc-sm"
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.6rem',
                      background: '#25D366',
                      borderColor: '#25D366',
                      color: '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">💧 Number of Cans *</label>
                  <input type="number" className="form-control" min={1} max={100}
                    value={orderForm.numberOfCans}
                    onChange={e => handleCansCountChange(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="form-label">💰 Price/Can</label>
                  <input type="text" className="form-control" value={`₹${pricePerCan}`} readOnly style={{ background: '#f9f9f9' }} />
                </div>
              </div>

              {/* Can Numbers Picker Grid & Manual Entry */}
              <div className="mb-3 p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <label className="form-label mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                    🛢️ Can Numbers ({selectedCanNumbers.length}/{orderForm.numberOfCans} Selected)
                  </label>
                  <button type="button" className="btn-wc btn-wc-sm btn-wc-outline" onClick={handleAutoSelect} style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}>
                    ⚡ Auto-Select Available
                  </button>
                </div>

                {/* Manual text input for typing can numbers e.g. 1, 2, 5 */}
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Manually type can numbers e.g. 1, 2, 5 or 1-5..."
                    value={manualCanInput}
                    onChange={(e) => handleManualInputChange(e.target.value)}
                    style={{ fontSize: '0.88rem' }}
                  />
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    💡 Type numbers (e.g. 1,2,5 or 1-5) or click buttons below:
                  </div>
                </div>

                <div className="d-flex gap-3 mb-2" style={{ fontSize: '0.78rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7' }}></span> Selected
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e2e8f0' }}></span> Available
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Blocked (Out on Delivery)
                  </span>
                </div>

                {canStatus ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '4px' }}>
                    {Array.from({ length: canStatus.totalCansCount || 50 }, (_, i) => i + 1).map((num) => {
                      const isBlocked = Boolean(canStatus.blockedMap?.[num]);
                      const isSelected = selectedCanNumbers.includes(num);
                      const blockInfo = canStatus.blockedMap?.[num];

                      return (
                        <button
                          key={num}
                          type="button"
                          disabled={isBlocked}
                          onClick={() => toggleCanSelection(num)}
                          title={isBlocked ? `Can #${num} is BLOCKED (Out with ${blockInfo?.customerName})` : `Can #${num} is available`}
                          style={{
                            padding: '0.4rem 0.2rem',
                            fontSize: '0.82rem',
                            fontWeight: isSelected || isBlocked ? 700 : 500,
                            borderRadius: '6px',
                            border: isSelected ? '2px solid #0284c7' : isBlocked ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                            background: isSelected ? '#0284c7' : isBlocked ? '#fee2e2' : '#ffffff',
                            color: isSelected ? '#ffffff' : isBlocked ? '#991b1b' : '#334155',
                            cursor: isBlocked ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s ease',
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

              <div className="mb-3 p-3" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)' }}>
                <div className="amount-row"><span className="amount-label">Total Amount</span><span className="amount-value">₹{totalAmount.toFixed(0)}</span></div>
                <div className="amount-row"><span className="amount-label">Amount Paid</span><span className="amount-value green">₹{parseFloat(orderForm.amountPaid) || 0}</span></div>
                <div className="amount-row"><span className="amount-label">Balance</span><span className={`amount-value ${balance > 0 ? 'red' : 'green'}`}>₹{balance.toFixed(0)}</span></div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">💵 Amount Paid</label>
                  <input type="number" className="form-control" min={0} max={totalAmount}
                    value={orderForm.amountPaid}
                    onChange={e => setOrderForm(f => ({ ...f, amountPaid: parseFloat(e.target.value) || 0 }))} />
                  <div className="d-flex gap-1 mt-1">
                    <button type="button" className="chip" onClick={() => setOrderForm(f => ({ ...f, amountPaid: totalAmount }))}>Full (₹{totalAmount})</button>
                    <button type="button" className="chip" onClick={() => setOrderForm(f => ({ ...f, amountPaid: 0 }))}>₹0</button>
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label">♻️ Empty Cans Returned</label>
                  <input type="number" className="form-control" min={0} max={orderForm.numberOfCans}
                    value={orderForm.emptyCansReturned}
                    onChange={e => setOrderForm(f => ({ ...f, emptyCansReturned: parseInt(e.target.value) || 0 }))} />
                  <div className="d-flex gap-1 mt-1">
                    <button type="button" className="chip" onClick={() => setOrderForm(f => ({ ...f, emptyCansReturned: f.numberOfCans }))}>All ({orderForm.numberOfCans})</button>
                    <button type="button" className="chip" onClick={() => setOrderForm(f => ({ ...f, emptyCansReturned: 0 }))}>0</button>
                  </div>
                </div>
              </div>

              {orderForm.amountPaid > 0 && (
                <div className="mb-3">
                  <label className="form-label">💳 Payment Method</label>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className={`btn-wc flex-fill btn-wc-sm ${orderForm.paymentMode === 'CASH' ? 'btn-wc-success' : 'btn-wc-outline'}`}
                      onClick={() => setOrderForm(f => ({ ...f, paymentMode: 'CASH' }))}
                      style={{ justifyContent: 'center' }}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      className={`btn-wc flex-fill btn-wc-sm ${orderForm.paymentMode === 'ONLINE' ? 'btn-wc-primary' : 'btn-wc-outline'}`}
                      onClick={() => setOrderForm(f => ({ ...f, paymentMode: 'ONLINE' }))}
                      style={{ justifyContent: 'center' }}
                    >
                      📱 Online / UPI
                    </button>
                  </div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">📋 Order Status</label>
                  <select className="form-select" value={orderForm.orderStatus}
                    onChange={e => setOrderForm(f => ({ ...f, orderStatus: e.target.value }))}>
                    {['DELIVERED','CANCELLED'].map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">🌐 Order Source</label>
                  <select className="form-select" value={orderForm.orderSource}
                    onChange={e => setOrderForm(f => ({ ...f, orderSource: e.target.value }))}>
                    <option value="OFFLINE">📞 Offline (Phone/Visit)</option>
                    <option value="ONLINE">🌐 Online</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">📝 Notes</label>
                <textarea className="form-control" rows={2} value={orderForm.notes}
                  onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        {step === 'order' && (
          <div className="modal-footer">
            <button onClick={onClose} className="btn-wc btn-wc-outline">Cancel</button>
            <button onClick={handlePlaceOrder} className="btn-wc btn-wc-primary" disabled={loading}>
              {loading ? 'Saving...' : '✅ Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOrderModal;

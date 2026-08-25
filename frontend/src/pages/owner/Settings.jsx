import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../api/settingsApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    pricePerCan: '',
    businessName: '',
    phoneNumber: '',
    address: '',
    totalCansCount: '50',
    newOwnerId: '',
    currentPassword: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  useEffect(() => {
    getSettings()
      .then(res => {
        const s = res.data.data;
        setSettings(s);
        setForm(f => ({
          ...f,
          pricePerCan: s.pricePerCan,
          businessName: s.businessName,
          phoneNumber: s.phoneNumber,
          address: s.address,
          totalCansCount: s.totalCansCount || 50,
          newOwnerId: s.ownerId || 'owner001',
        }));
      })
      .catch(() => showAlert('Failed to load settings', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.pricePerCan || parseFloat(form.pricePerCan) <= 0) {
      showAlert('Price per can must be greater than 0', 'danger');
      return;
    }
    if (!form.totalCansCount || parseInt(form.totalCansCount) < 1) {
      showAlert('Total number of cans must be at least 1', 'danger');
      return;
    }
    if (form.newPassword && !form.currentPassword) {
      showAlert('Please enter your current password to set a new password', 'danger');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        pricePerCan: parseFloat(form.pricePerCan),
        businessName: form.businessName,
        phoneNumber: form.phoneNumber,
        address: form.address,
        totalCansCount: parseInt(form.totalCansCount),
      };

      if (form.newOwnerId) payload.newOwnerId = form.newOwnerId;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await updateSettings(payload);
      const updatedData = res.data.data;
      setSettings(updatedData);
      setForm(f => ({
        ...f,
        currentPassword: '',
        newPassword: '',
        newOwnerId: updatedData.ownerId || f.newOwnerId,
      }));
      showAlert(res.data.message || 'Settings saved successfully!');
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to save settings', 'danger');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="main-content"><LoadingSpinner /></div>;

  return (
    <div className="main-content" style={{ minHeight: '100vh' }}>
      {alert && <div className={`alert-wc alert-${alert.type}`}>{alert.msg}</div>}

      <div className="page-header">
        <div className="page-title">⚙️ Settings</div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <form onSubmit={handleSave}>
            {/* Total Cans Capacity */}
            <div className="settings-card">
              <div className="settings-section-title">🛢️ Can Stock & Inventory (Numbered Cans)</div>

              <div className="mb-3">
                <label className="form-label">Total Number of Cans * (Example: 50 for 1-50, 100 for 1-100)</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="10000"
                  value={form.totalCansCount}
                  onChange={e => setForm(f => ({ ...f, totalCansCount: e.target.value }))}
                />
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setForm(f => ({ ...f, totalCansCount: 50 }))}
                  >
                    Preset: 1-50 (50 Cans)
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setForm(f => ({ ...f, totalCansCount: 100 }))}
                  >
                    Preset: 1-100 (100 Cans)
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setForm(f => ({ ...f, totalCansCount: 200 }))}
                  >
                    Preset: 1-200 (200 Cans)
                  </button>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  ℹ️ This sets your available numbered cans sequence (1 to {form.totalCansCount || 50}). Individual cans will be blocked on delivery and unblocked on return.
                </div>
              </div>

              <div className="p-3" style={{ background: '#e0f2fe', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', color: '#0369a1' }}>
                <strong>Active Range:</strong> Can #1 to Can #{settings?.totalCansCount || 50}
              </div>
            </div>

            {/* Pricing */}
            <div className="settings-card">
              <div className="settings-section-title">💰 Pricing</div>

              <div className="mb-3">
                <label className="form-label">Price Per Can (₹) *</label>
                <input
                  type="number"
                  className="form-control"
                  step="0.50"
                  min="1"
                  max="1000"
                  value={form.pricePerCan}
                  onChange={e => setForm(f => ({ ...f, pricePerCan: e.target.value }))}
                />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  ⚠️ Changing this only affects future orders. Past orders retain their original price.
                </div>
              </div>

              <div className="p-3" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                <strong>Current Price:</strong> ₹{settings?.pricePerCan} per can
              </div>
            </div>

            {/* Business Info */}
            <div className="settings-card">
              <div className="settings-section-title">🏢 Business Information</div>

              <div className="mb-3">
                <label className="form-label">Business Name</label>
                <input type="text" className="form-control" value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-control" value={form.phoneNumber}
                  onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows={2} value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>

            {/* Account Credentials */}
            <div className="settings-card">
              <div className="settings-section-title">🔑 Account & Login Credentials (MongoDB)</div>

              <div className="mb-3">
                <label className="form-label">Owner ID / Username</label>
                <input type="text" className="form-control" value={form.newOwnerId}
                  onChange={e => setForm(f => ({ ...f, newOwnerId: e.target.value }))} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Used to sign into the Owner Dashboard.
                </div>
              </div>

              <hr />

              <div className="settings-section-title" style={{ fontSize: '0.95rem' }}>🔐 Change Password</div>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" placeholder="Enter current password to change" value={form.currentPassword}
                  onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="Leave blank to keep unchanged" value={form.newPassword}
                  onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
              </div>
            </div>

            <button type="submit" className="btn-primary-wc" disabled={saving}>
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </form>
        </div>

        <div className="col-lg-5">
          <div className="settings-card">
            <div className="settings-section-title">📋 Current Configuration</div>
            {settings && (
              <div>
                {[
                  ['👤 Owner ID', settings.ownerId || 'owner001'],
                  ['🛢️ Total Cans Sequence', `1 to ${settings.totalCansCount || 50} (${settings.totalCansCount || 50} Cans)`],
                  ['💰 Price Per Can', `₹${settings.pricePerCan}`],
                  ['🏢 Business Name', settings.businessName],
                  ['📱 Phone', settings.phoneNumber],
                  ['📍 Address', settings.address],
                  ['🕒 Last Updated', settings.updatedAt ? new Date(settings.updatedAt).toLocaleString('en-IN') : 'N/A'],
                ].map(([label, val]) => (
                  <div key={label} className="amount-row">
                    <span className="amount-label">{label}</span>
                    <span className="amount-value">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="settings-card">
            <div className="settings-section-title">🔒 Security & Database</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              All configuration, prices, contact information, and owner credentials are standard documents stored securely inside MongoDB Atlas.
            </p>
            <div className="p-3" style={{ background: '#f0fff4', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#065f46' }}>
              ✅ MongoDB Atlas connected — Settings & Account credentials stored in DB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


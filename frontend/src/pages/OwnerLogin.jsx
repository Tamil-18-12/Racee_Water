import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaWater, FaEye, FaEyeSlash } from 'react-icons/fa';

const OwnerLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ownerId: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ownerId || !form.password) {
      setError('Please enter Owner ID and Password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form.ownerId, form.password);
      navigate('/owner/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('⚠️ Cannot connect to server. Make sure the Spring Boot backend is running on port 8080.');
      } else {
        setError(err.response?.data?.message || 'Invalid Owner ID or Password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔑</div>
        <h1 className="login-title">Owner Login</h1>
        <p className="login-subtitle">Sign in to manage your water delivery business</p>

        {error && <div className="alert-wc alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Owner ID</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your Owner ID"
              value={form.ownerId}
              onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
              autoComplete="username"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary-wc" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔑 Login to Dashboard'}
          </button>
        </form>

        <div className="mt-4 p-3 text-center" style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <FaWater style={{ color: 'var(--primary)' }} />
          <span className="ms-1">Default credentials: <strong>owner001</strong> / <strong>Admin@123</strong></span>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin;

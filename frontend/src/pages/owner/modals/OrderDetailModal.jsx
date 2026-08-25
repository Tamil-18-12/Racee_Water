import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../../components/StatusBadge';
import AssignCansModal from './AssignCansModal';
import { FaPhoneAlt, FaWhatsapp, FaUser, FaMoneyBillWave, FaRecycle, FaWater, FaCalendarAlt, FaMapMarkerAlt, FaTag, FaCheckCircle, FaTrash, FaCheck } from 'react-icons/fa';

const fmtDate = (d) => {
  if (!d) return '—';
  const dateObj = new Date(d);
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_OPTIONS = [
  { value: 'DELIVERED', label: '✅ Delivered', color: '#10b981', bg: '#d1fae5' },
  { value: 'CANCELLED', label: '❌ Cancelled', color: '#ef4444', bg: '#fee2e2' },
];

const OrderDetailModal = ({
  order,
  onClose,
  onOpenPayment,
  onOpenEmptyCan,
  onStatusChange,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assignCansTargetStatus, setAssignCansTargetStatus] = useState(null);

  if (!order) return null;

  const handleStatusSelect = async (newStatus) => {
    if (newStatus === order.orderStatus) return;
    if (
      (newStatus === 'OUT_FOR_DELIVERY' || newStatus === 'DELIVERED') &&
      (!order.canNumbers || order.canNumbers.length === 0)
    ) {
      setAssignCansTargetStatus(newStatus);
      return;
    }

    setUpdatingStatus(true);
    try {
      if (onStatusChange) {
        await onStatusChange(order.id, newStatus);
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const cleanPhone = (order.mobile || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(
    `Hello ${order.customerName}, regarding your Water Can Order (#${order.orderId}): Total ₹${order.totalAmount}, Balance Due: ₹${order.balanceAmount}. Cans Pending: ${order.emptyCansPending}.`
  )}`;

  const handleDelete = () => {
    if (onDelete) {
      onClose();
      onDelete(order.id);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-box"
        style={{
          maxWidth: 520,
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
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
            <span style={{ fontSize: '1.4rem' }}>📋</span>
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>Order & Customer Details</h5>
              <small style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>
                ID: {order.orderId}
              </small>
            </div>
          </div>
          <button
            className="modal-close"
            style={{ color: '#fff', opacity: 0.9, fontSize: '1.5rem' }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          className="modal-body"
          style={{
            padding: '1.2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Customer Profile Card */}
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {order.customerName ? order.customerName.charAt(0).toUpperCase() : '👤'}
                </span>
                <div>
                  <h6
                    className="mb-0 fw-bold"
                    style={{ color: 'var(--primary-dark)', cursor: 'pointer', fontSize: '1.05rem' }}
                    onClick={() => {
                      onClose();
                      navigate(`/owner/customers/${order.customerId}`);
                    }}
                    title="Click to view customer profile"
                  >
                    {order.customerName} ↗
                  </h6>
                  <small style={{ color: 'var(--text-muted)' }}>Customer</small>
                </div>
              </div>
              <button
                className="btn-wc btn-wc-sm btn-wc-outline"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                onClick={() => {
                  onClose();
                  navigate(`/owner/customers/${order.customerId}`);
                }}
              >
                <FaUser /> History
              </button>
            </div>

            {/* Mobile & Action Buttons */}
            <div
              className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2"
              style={{ borderTop: '1px dashed #cae9ff' }}
            >
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#03045e' }}>
                📞 {order.mobile}
              </div>
              <div className="d-flex gap-2">
                <a
                  href={`tel:${order.mobile}`}
                  className="btn-wc btn-wc-sm btn-wc-primary"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', fontWeight: 600 }}
                >
                  <FaPhoneAlt /> Call
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wc btn-wc-sm btn-wc-success"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: '#25D366', borderColor: '#25D366', fontWeight: 600 }}
                >
                  <FaWhatsapp /> WhatsApp
                </a>
              </div>
            </div>

            {order.address && (
              <div className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>
                <FaMapMarkerAlt style={{ color: 'var(--primary)', marginRight: 4 }} />
                {order.address}
              </div>
            )}
          </div>

          {/* 1-Tap Order Status Selector */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e0f2fe',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 2px 6px rgba(0,119,182,0.06)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-dark)' }}>
                📦 Order Status (Tap to Change)
              </span>
              <StatusBadge value={order.orderStatus} />
            </div>

            <div className="d-flex flex-wrap gap-2 mt-2">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = order.orderStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleStatusSelect(opt.value)}
                    style={{
                      border: isActive ? `2px solid ${opt.color}` : '1px solid #cbd5e1',
                      background: isActive ? opt.bg : '#ffffff',
                      color: isActive ? opt.color : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      flex: '1 1 auto',
                      justifyContent: 'center',
                    }}
                  >
                    {isActive && <FaCheck size={10} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <FaCalendarAlt style={{ marginRight: 4 }} />
              Ordered: {fmtDate(order.createdAt)} • Source: <StatusBadge value={order.orderSource} />
            </div>
          </div>

          {/* Quick Metrics: Cans Ordered & Rate */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e0f2fe',
              borderRadius: '12px',
              padding: '0.9rem 1rem',
              boxShadow: '0 2px 6px rgba(0,119,182,0.06)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>💧 Cans Ordered</small>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {order.numberOfCans} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Cans</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block' }}>Total Amount</small>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#03045e' }}>
                  ₹{order.totalAmount}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section (Detailed Amount Paid & Balance Due + Edit Option) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <FaMoneyBillWave style={{ color: 'var(--success)', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#03045e' }}>
                  Payment Details
                </span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <StatusBadge value={order.paymentStatus} type="payment" />
                {order.paymentMode && order.paymentMode !== 'PENDING' && (
                  <StatusBadge value={order.paymentMode} type="paymentMode" />
                )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total</small>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#03045e' }}>
                  ₹{order.totalAmount}
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Paid</small>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--success)' }}>
                  ₹{order.amountPaid}
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending Due</small>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: order.balanceAmount > 0 ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  ₹{order.balanceAmount}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-wc btn-wc-success w-100"
              style={{ justifyContent: 'center', padding: '0.6rem', fontWeight: 600 }}
              onClick={() => {
                onClose();
                if (onOpenPayment) onOpenPayment(order);
              }}
            >
              💰 {order.balanceAmount > 0 ? `Record / Edit Payment (₹${order.balanceAmount} Due)` : 'View / Edit Payment'}
            </button>
          </div>

          {/* Empty Can Return Section (Detailed Cans Return + Edit Option) */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <FaRecycle style={{ color: '#6c5ce7', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#03045e' }}>
                  Empty Can Return Details
                </span>
              </div>
              {order.emptyCansPending === 0 ? (
                <span className="badge-status badge-delivered" style={{ fontSize: '0.75rem' }}>
                  ✅ All Returned
                </span>
              ) : (
                <span className="badge-status badge-pending" style={{ fontSize: '0.75rem' }}>
                  ⏳ {order.emptyCansPending} Pending
                </span>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                textAlign: 'center',
                background: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Delivered Out</small>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                  💧 {order.emptyCansDelivered}
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Returned In</small>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--success)' }}>
                  ♻️ {order.emptyCansReturned}
                </div>
              </div>
              <div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending Return</small>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: order.emptyCansPending > 0 ? 'var(--warning)' : 'var(--success)',
                  }}
                >
                  ⏳ {order.emptyCansPending}
                </div>
              </div>
            </div>

            {/* Numbered Cans Assigned Badges */}
            {Array.isArray(order.canNumbers) && order.canNumbers.length > 0 && (
              <div className="mb-3 p-2" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>
                  🛢️ Assigned Can Numbers:
                </small>
                <div className="d-flex flex-wrap gap-1">
                  {order.canNumbers.map((num) => {
                    const isReturned = Array.isArray(order.returnedCanNumbers) && order.returnedCanNumbers.includes(num);
                    return (
                      <span
                        key={num}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: isReturned ? '#dcfce7' : '#fee2e2',
                          color: isReturned ? '#166534' : '#991b1b',
                          border: isReturned ? '1px solid #86efac' : '1px solid #fca5a5',
                        }}
                      >
                        {isReturned ? `✅ Can #${num}` : `🔒 Can #${num} (Out)`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn-wc btn-wc-warning w-100"
              style={{ justifyContent: 'center', padding: '0.6rem', fontWeight: 600 }}
              onClick={() => {
                onClose();
                if (onOpenEmptyCan) onOpenEmptyCan(order);
              }}
            >
              ♻️ {order.emptyCansPending > 0 ? `Record Can Return (${order.emptyCansPending} Pending)` : 'Can Return History'}
            </button>
          </div>

          {/* Notes or Additional info */}
          {order.notes && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '8px',
                padding: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <strong>📝 Notes:</strong> {order.notes}
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div
          className="modal-footer"
          style={{
            padding: '0.8rem 1.25rem',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          {onDelete && (
            <button
              type="button"
              className="btn-wc btn-wc-danger btn-wc-sm"
              onClick={handleDelete}
              title="Delete this order"
            >
              <FaTrash /> Delete
            </button>
          )}
          <button
            type="button"
            className="btn-wc btn-wc-outline flex-fill"
            style={{ justifyContent: 'center' }}
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn-wc btn-wc-primary flex-fill"
            style={{ justifyContent: 'center' }}
            onClick={() => {
              onClose();
              navigate(`/owner/customers/${order.customerId}`);
            }}
          >
            <FaUser /> Customer History
          </button>
        </div>
      </div>

      {assignCansTargetStatus && (
        <AssignCansModal
          order={order}
          targetStatus={assignCansTargetStatus}
          onClose={() => setAssignCansTargetStatus(null)}
          onSuccess={() => {
            setAssignCansTargetStatus(null);
            onClose();
            if (onStatusChange) onStatusChange(order.id, assignCansTargetStatus);
          }}
        />
      )}
    </div>
  );
};

export default OrderDetailModal;


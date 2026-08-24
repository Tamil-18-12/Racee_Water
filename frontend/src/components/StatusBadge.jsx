import React from 'react';

const STATUS_MAP = {
  PENDING: { label: 'Pending', cls: 'badge-pending', icon: '⏳' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-confirmed', icon: '✅' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', cls: 'badge-out-for-delivery', icon: '🚚' },
  DELIVERED: { label: 'Delivered', cls: 'badge-delivered', icon: '✔️' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled', icon: '❌' },
  PAID: { label: 'Paid', cls: 'badge-paid', icon: '💰' },
  PARTIAL: { label: 'Partial', cls: 'badge-partial', icon: '⚠️' },
  PAYMENT_PENDING: { label: 'Unpaid', cls: 'badge-payment-pending', icon: '❗' },
  ONLINE: { label: 'Online', cls: 'badge-online', icon: '🌐' },
  OFFLINE: { label: 'Offline', cls: 'badge-offline', icon: '📞' },
  CASH: { label: 'Cash', cls: 'badge-cash', icon: '💵' },
  ONLINE_PAY: { label: 'Online', cls: 'badge-online-pay', icon: '📱' },
  UPI: { label: 'UPI', cls: 'badge-online-pay', icon: '⚡' },
};

const StatusBadge = ({ value, type = 'order' }) => {
  if (!value) return null;
  let key = value;
  if (type === 'payment' && value === 'PENDING') key = 'PAYMENT_PENDING';
  if (type === 'paymentMode' && (value === 'ONLINE' || value === 'ONLINE_PAY')) key = 'ONLINE_PAY';
  if (type === 'paymentMode' && value === 'PENDING') key = 'PAYMENT_PENDING';
  const config = STATUS_MAP[key] || { label: value, cls: 'badge-confirmed', icon: '•' };
  return (
    <span className={`badge-status ${config.cls}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default StatusBadge;


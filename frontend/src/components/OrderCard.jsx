import React from 'react';
import { FaPhoneAlt, FaChevronRight } from 'react-icons/fa';

const OrderCard = ({
  order,
  onViewDetails,
}) => {
  if (!order) return null;

  const isOrderPending = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED' || order.orderStatus === 'OUT_FOR_DELIVERY';
  const isPaymentPending = order.balanceAmount > 0;
  const isCanPending = order.emptyCansPending > 0;
  const isCancelled = order.orderStatus === 'CANCELLED';

  const isPending = (isOrderPending || isPaymentPending || isCanPending) && !isCancelled;

  const initial = order.customerName ? order.customerName.charAt(0).toUpperCase() : '👤';

  return (
    <div
      className="order-card-compact"
      onClick={() => onViewDetails && onViewDetails(order)}
      role="button"
      tabIndex={0}
      title="Click to view full details & edit options"
    >
      <div className="order-card-compact-left">
        <div className={`order-customer-avatar ${isPending ? 'avatar-pending' : 'avatar-done'}`}>
          {initial}
        </div>
        <div className="order-customer-info">
          <div className="order-customer-name">
            {order.customerName || 'Customer'}
          </div>
          <div className="order-customer-phone" onClick={(e) => e.stopPropagation()}>
            <a href={`tel:${order.mobile}`} className="phone-link" title="Tap to call">
              <FaPhoneAlt className="phone-icon" /> {order.mobile || 'No number'}
            </a>
          </div>
        </div>
      </div>

      <div className="order-card-compact-right">
        <div className="order-pending-badge-group">
          {isCancelled ? (
            <span className="order-badge badge-cancelled">
              ❌ Cancelled
            </span>
          ) : isPending ? (
            <div className="d-flex flex-column align-items-end gap-1">
              <span className="order-badge badge-pending-main">
                ⏳ PENDING
              </span>
              <div className="d-flex gap-1 flex-wrap justify-content-end">
                {isPaymentPending && (
                  <span className="order-sub-badge badge-money-due">
                    ₹{order.balanceAmount} due
                  </span>
                )}
                {isCanPending && (
                  <span className="order-sub-badge badge-can-due">
                    ♻️ {order.emptyCansPending} cans
                  </span>
                )}
                {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                  <span className="order-sub-badge badge-delivery">
                    🚚 On Way
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="order-badge badge-completed-main">
              ✅ COMPLETED
            </span>
          )}
        </div>
        <div className="order-card-arrow">
          <FaChevronRight />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;


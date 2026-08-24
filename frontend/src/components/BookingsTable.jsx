import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const BookingsTable = ({ orders, onViewDetails }) => {
  if (!orders || orders.length === 0) return null;

  return (
    <div className="bookings-card">
      <div style={{ overflowX: 'auto' }}>
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isOrderPending =
                order.orderStatus === 'PENDING' ||
                order.orderStatus === 'CONFIRMED' ||
                order.orderStatus === 'OUT_FOR_DELIVERY';
              const isPaymentPending = order.balanceAmount > 0;
              const isCanPending = order.emptyCansPending > 0;
              const isCancelled = order.orderStatus === 'CANCELLED';

              const isPending =
                (isOrderPending || isPaymentPending || isCanPending) && !isCancelled;

              return (
                <tr
                  key={order.id}
                  onClick={() => onViewDetails && onViewDetails(order)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="booking-name">{order.customerName || 'Customer'}</td>
                  <td className="booking-phone">{order.mobile || '—'}</td>
                  <td>
                    {isCancelled ? (
                      <span className="booking-status-badge cancelled">Cancelled</span>
                    ) : isPending ? (
                      <span className="booking-status-badge pending">Pending</span>
                    ) : (
                      <span className="booking-status-badge completed">Completed</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-view-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails && onViewDetails(order);
                      }}
                    >
                      View Details <FaChevronRight size={10} style={{ marginLeft: '4px' }} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTable;

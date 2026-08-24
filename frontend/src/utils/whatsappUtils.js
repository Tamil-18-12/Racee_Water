/**
 * Helper utilities for formatting WhatsApp links and personalized templates.
 */

export const formatWhatsAppPhone = (phone) => {
  if (!phone) return '';
  const clean = phone.toString().replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `91${clean}`;
  }
  return clean;
};

/**
 * Generate WhatsApp welcome message URL for new customer registration
 */
export const getWhatsAppWelcomeUrl = (customer, businessName = 'Racee Water', businessPhone = '9345038836') => {
  if (!customer || !customer.mobile) return '';
  const waPhone = formatWhatsAppPhone(customer.mobile);
  if (!waPhone) return '';

  const msg = 
`💧 *Welcome to ${businessName}!* 💧

Dear *${customer.name || 'Customer'}*,

Thank you for choosing ${businessName}! Your customer account has been registered successfully.

📋 *Your Details:*
• Mobile: ${customer.mobile}
${customer.address ? `• Address: ${customer.address}\n` : ''}
🚚 *Need fresh water delivered?*
• Fast doorstep delivery
• Call or WhatsApp us anytime: +91 ${businessPhone}

We look forward to serving you! 🚰✨`;

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
};

/**
 * Generate WhatsApp message URL for order details / updates
 */
export const getWhatsAppOrderUrl = (order, businessName = 'Racee Water') => {
  if (!order || !order.mobile) return '';
  const waPhone = formatWhatsAppPhone(order.mobile);
  if (!waPhone) return '';

  const orderId = order.orderId || order.id || 'N/A';
  const cans = order.numberOfCans || 1;
  const total = order.totalAmount || 0;
  const paid = order.amountPaid || 0;
  const balance = order.balanceAmount !== undefined ? order.balanceAmount : (total - paid);
  const emptyPending = order.emptyCansPending !== undefined ? order.emptyCansPending : 0;

  const msg = 
`💧 *${businessName} - Order Details* 💧

Hello *${order.customerName || 'Customer'}*,

Here are your order details (#${orderId}):
• 💧 *Water Cans:* ${cans} can${cans > 1 ? 's' : ''}
• 💰 *Total Amount:* ₹${total}
• 💵 *Amount Paid:* ₹${paid}
• 💳 *Balance Due:* ₹${balance}
• ♻️ *Empty Cans Pending:* ${emptyPending}
• 📦 *Status:* ${order.orderStatus || 'DELIVERED'}

Thank you for your business! 🙏`;

  return `https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`;
};

/**
 * Safely open WhatsApp in a new browser tab/window
 */
export const openWhatsApp = (url) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

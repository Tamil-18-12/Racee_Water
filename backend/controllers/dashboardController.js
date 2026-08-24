import Order from '../models/Order.js';

const formatDateShort = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${monthNames[d.getMonth()]}`;
};

export const getSummary = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const allOrders = await Order.find();
    const todayOrders = allOrders.filter((o) => o.createdAt >= todayStart && o.createdAt <= todayEnd);

    // Today metrics
    const todayOrderCount = todayOrders.length;
    const todayCans = todayOrders.reduce((sum, o) => sum + (o.numberOfCans || 0), 0);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const todayCollected = todayOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);

    // Overall order status counts
    const pendingOrders = allOrders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
    ).length;

    const deliveredOrders = allOrders.filter((o) => o.orderStatus === 'DELIVERED').length;

    // Overall financial & can tracking
    const moneyPending = allOrders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
    const emptyCansPending = allOrders.reduce((sum, o) => sum + (o.emptyCansPending || 0), 0);
    const emptyCansDelivered = allOrders.reduce((sum, o) => sum + (o.emptyCansDelivered || 0), 0);
    const emptyCansReturned = allOrders.reduce((sum, o) => sum + (o.emptyCansReturned || 0), 0);

    // Payment status counts
    const paidCount = allOrders.filter((o) => o.paymentStatus === 'PAID').length;
    const partialCount = allOrders.filter((o) => o.paymentStatus === 'PARTIAL').length;
    const pendingPaymentCount = allOrders.filter((o) => o.paymentStatus === 'PENDING').length;

    // Last 7 days charts
    const dailyOrdersChart = [];
    const dailySalesChart = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dayOrders = allOrders.filter((o) => o.createdAt >= d && o.createdAt <= dEnd);
      const daySales = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const label = formatDateShort(d);
      dailyOrdersChart.push({ date: label, orders: dayOrders.length });
      dailySalesChart.push({ date: label, sales: daySales });
    }

    res.status(200).json({
      success: true,
      message: 'Success',
      data: {
        todayOrders: todayOrderCount,
        todayCans,
        todaySales,
        todayCollected,
        pendingOrders,
        deliveredOrders,
        moneyPending,
        emptyCansPending,
        emptyCansDelivered,
        emptyCansReturned,
        paidCount,
        partialCount,
        pendingPaymentCount,
        dailyOrdersChart,
        dailySalesChart,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTodayOrders = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Success',
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

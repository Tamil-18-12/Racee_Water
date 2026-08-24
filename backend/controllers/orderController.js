import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Settings from '../models/Settings.js';
import { generateOrderId } from '../utils/orderIdGenerator.js';

const getPricePerCan = async () => {
  const settings = await Settings.findOne();
  return settings ? settings.pricePerCan : 20.0;
};

const determinePaymentStatus = (paid, total) => {
  if (paid <= 0) return 'PENDING';
  if (paid >= total) return 'PAID';
  return 'PARTIAL';
};

const findOrderByIdOrCustomId = async (id) => {
  let order = null;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(id);
  }
  if (!order) {
    order = await Order.findOne({ orderId: id });
  }
  return order;
};

export const createPublicOrder = async (req, res, next) => {
  try {
    const { customerName, mobile, address, numberOfCans, notes } = req.body;

    if (!customerName || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Name and mobile number are required for online booking.',
        data: null,
      });
    }

    const cans = parseInt(numberOfCans, 10);
    if (isNaN(cans) || cans < 1 || cans > 100) {
      return res.status(400).json({
        success: false,
        message: 'Number of cans must be between 1 and 100.',
        data: null,
      });
    }

    // Find or create customer
    let customer = await Customer.findOne({ mobile: mobile.trim() });
    if (!customer) {
      customer = await Customer.create({
        name: customerName.trim(),
        mobile: mobile.trim(),
        address: address ? address.trim() : '',
      });
    }

    const pricePerCan = await getPricePerCan();
    const totalAmount = cans * pricePerCan;
    const amountPaid = 0;
    const balanceAmount = totalAmount;
    const emptyCansDelivered = cans;
    const emptyCansReturned = 0;
    const emptyCansPending = cans;

    const order = await Order.create({
      orderId: generateOrderId(),
      customerId: customer._id,
      customerName: customer.name,
      mobile: customer.mobile,
      numberOfCans: cans,
      pricePerCan,
      totalAmount,
      amountPaid,
      balanceAmount,
      emptyCansDelivered,
      emptyCansReturned,
      emptyCansPending,
      orderSource: 'ONLINE',
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMode: 'PENDING',
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Your water can order has been placed successfully!',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const createOrderForCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { numberOfCans, amountPaid, paymentMode, emptyCansReturned, orderSource, orderStatus, notes } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found: ${customerId}`,
        data: null,
      });
    }

    const cans = parseInt(numberOfCans, 10);
    if (isNaN(cans) || cans < 1 || cans > 100) {
      return res.status(400).json({
        success: false,
        message: 'Number of cans must be between 1 and 100.',
        data: null,
      });
    }

    const pricePerCan = await getPricePerCan();
    const totalAmount = cans * pricePerCan;
    const paid = Math.max(0, Math.min(Number(amountPaid) || 0, totalAmount));
    const balanceAmount = totalAmount - paid;

    const deliveredCans = cans;
    const returnedCans = Math.max(0, Math.min(parseInt(emptyCansReturned, 10) || 0, deliveredCans));
    const pendingCans = deliveredCans - returnedCans;

    const paymentStatus = determinePaymentStatus(paid, totalAmount);
    const resolvedPaymentMode = paid > 0 ? (paymentMode || 'CASH') : 'PENDING';

    const order = await Order.create({
      orderId: generateOrderId(),
      customerId: customer._id,
      customerName: customer.name,
      mobile: customer.mobile,
      numberOfCans: cans,
      pricePerCan,
      totalAmount,
      amountPaid: paid,
      balanceAmount,
      emptyCansDelivered: deliveredCans,
      emptyCansReturned: returnedCans,
      emptyCansPending: pendingCans,
      orderSource: orderSource || 'OFFLINE',
      orderStatus: orderStatus || 'PENDING',
      paymentStatus,
      paymentMode: resolvedPaymentMode,
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Order added successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Success',
      data: orders,
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

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await findOrderByIdOrCustomId(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found: ${id}`,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Success',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrdersByCustomer = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Success',
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const addPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMode } = req.body || {};

    const payment = Number(amount);
    if (isNaN(payment) || payment < 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be a positive number.',
        data: null,
      });
    }

    const order = await findOrderByIdOrCustomId(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found: ${id}`,
        data: null,
      });
    }

    const newPaid = order.amountPaid + payment;
    if (newPaid > order.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Total paid (₹${newPaid}) cannot exceed order total (₹${order.totalAmount}).`,
        data: null,
      });
    }

    order.amountPaid = newPaid;
    order.balanceAmount = order.totalAmount - newPaid;
    order.paymentStatus = determinePaymentStatus(newPaid, order.totalAmount);
    if (paymentMode) {
      order.paymentMode = paymentMode;
    } else if (order.paymentMode === 'PENDING' || !order.paymentMode) {
      order.paymentMode = 'CASH';
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const addEmptyCanReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { returnedCans } = req.body || {};

    const cans = parseInt(returnedCans, 10);
    if (isNaN(cans) || cans < 0) {
      return res.status(400).json({
        success: false,
        message: 'Returned cans must be a positive number.',
        data: null,
      });
    }

    const order = await findOrderByIdOrCustomId(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found: ${id}`,
        data: null,
      });
    }

    const newReturned = order.emptyCansReturned + cans;
    if (newReturned > order.emptyCansDelivered) {
      return res.status(400).json({
        success: false,
        message: `Returned cans (${newReturned}) cannot exceed delivered cans (${order.emptyCansDelivered}).`,
        data: null,
      });
    }

    order.emptyCansReturned = newReturned;
    order.emptyCansPending = order.emptyCansDelivered - newReturned;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Empty can return recorded successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body?.status || req.query?.status;

    const validStatuses = ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`,
        data: null,
      });
    }

    const order = await findOrderByIdOrCustomId(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found: ${id}`,
        data: null,
      });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await findOrderByIdOrCustomId(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found: ${id}`,
        data: null,
      });
    }

    await Order.findByIdAndDelete(order._id);

    res.status(200).json({
      success: true,
      message: 'Order deleted',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

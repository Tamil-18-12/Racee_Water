import Customer from '../models/Customer.js';
import Order from '../models/Order.js';

export const getCustomerWithStats = async (customerDoc) => {
  const customer = customerDoc.toJSON ? customerDoc.toJSON() : customerDoc;
  const orders = await Order.find({ customerId: customer.id });

  const totalOrders = orders.length;
  const totalCans = orders.reduce((sum, o) => sum + (o.numberOfCans || 0), 0);
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPaid = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
  const totalPending = orders.reduce((sum, o) => sum + (o.balanceAmount || 0), 0);
  const totalEmptyDelivered = orders.reduce((sum, o) => sum + (o.emptyCansDelivered || 0), 0);
  const totalEmptyReturned = orders.reduce((sum, o) => sum + (o.emptyCansReturned || 0), 0);
  const totalEmptyPending = orders.reduce((sum, o) => sum + (o.emptyCansPending || 0), 0);

  return {
    ...customer,
    totalOrders,
    totalCans,
    totalAmount,
    totalPaid,
    totalPending,
    totalEmptyDelivered,
    totalEmptyReturned,
    totalEmptyPending,
  };
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, mobile, address } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and mobile number are required',
        data: null,
      });
    }

    const existing = await Customer.findOne({ mobile: mobile.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A customer with mobile number ${mobile} already exists. Please search and add an order to the existing customer.`,
        data: null,
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      mobile: mobile.trim(),
      address: address ? address.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const customersWithStats = await Promise.all(
      customers.map((c) => getCustomerWithStats(c))
    );

    res.status(200).json({
      success: true,
      message: 'Success',
      data: customersWithStats,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id: ${id}`,
        data: null,
      });
    }

    const customerWithStats = await getCustomerWithStats(customer);
    res.status(200).json({
      success: true,
      message: 'Success',
      data: customerWithStats,
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerByMobile = async (req, res, next) => {
  try {
    const { mobile } = req.params;
    const customer = await Customer.findOne({ mobile: mobile.trim() });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `No customer found with mobile: ${mobile}`,
        data: null,
      });
    }

    const customerWithStats = await getCustomerWithStats(customer);
    res.status(200).json({
      success: true,
      message: 'Success',
      data: customerWithStats,
    });
  } catch (err) {
    next(err);
  }
};

export const searchCustomers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({
        success: true,
        message: 'Success',
        data: [],
      });
    }

    const regex = new RegExp(query.trim(), 'i');
    const customers = await Customer.find({
      $or: [{ name: regex }, { mobile: regex }],
    }).sort({ createdAt: -1 });

    const customersWithStats = await Promise.all(
      customers.map((c) => getCustomerWithStats(c))
    );

    res.status(200).json({
      success: true,
      message: 'Success',
      data: customersWithStats,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, mobile, address } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found with id: ${id}`,
        data: null,
      });
    }

    if (mobile && mobile.trim() !== customer.mobile) {
      const duplicate = await Customer.findOne({ mobile: mobile.trim(), _id: { $ne: id } });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Mobile number ${mobile} is already in use.`,
          data: null,
        });
      }
      customer.mobile = mobile.trim();
    }

    if (name) customer.name = name.trim();
    if (address !== undefined) customer.address = address.trim();

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

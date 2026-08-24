import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import Settings from '../models/Settings.js';
import { getCustomerWithStats } from './customerController.js';
import {
  generateCustomerHistoryPdfBuffer,
  generateDailyReportPdfBuffer,
  generateCustomersPdfBuffer,
  generateOrdersPdfBuffer,
  generateOrdersExcelBuffer,
  generateCustomersExcelBuffer,
} from '../utils/reportGenerator.js';

export const customerHistoryPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found: ${id}`,
        data: null,
      });
    }

    const customerWithStats = await getCustomerWithStats(customer);
    const orders = await Order.find({ customerId: customer._id }).sort({ createdAt: -1 });
    const settings = (await Settings.findOne()) || {};

    const pdfBuffer = await generateCustomerHistoryPdfBuffer(customerWithStats, orders, settings);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="customer-history.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    next(err);
  }
};

export const dailyReportPdf = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const settings = (await Settings.findOne()) || {};
    const pdfBuffer = await generateDailyReportPdfBuffer(start, orders, settings);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daily-report.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    next(err);
  }
};

export const customersPdf = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const customersWithStats = await Promise.all(
      customers.map((c) => getCustomerWithStats(c))
    );
    const settings = (await Settings.findOne()) || {};

    const pdfBuffer = await generateCustomersPdfBuffer(customersWithStats, settings);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    next(err);
  }
};

export const ordersPdf = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const settings = (await Settings.findOne()) || {};

    const pdfBuffer = await generateOrdersPdfBuffer(orders, settings);
    const buffer = Buffer.from(pdfBuffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    next(err);
  }
};

export const ordersExcel = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const excelBuffer = await generateOrdersExcelBuffer(orders);
    const buffer = Buffer.from(excelBuffer);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="orders.xlsx"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    next(err);
  }
};

export const customersExcel = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    const customersWithStats = await Promise.all(
      customers.map((c) => getCustomerWithStats(c))
    );

    const excelBuffer = await generateCustomersExcelBuffer(customersWithStats);
    const buffer = Buffer.from(excelBuffer);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="customers.xlsx"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    next(err);
  }
};


import express from 'express';
import {
  customerHistoryPdf,
  dailyReportPdf,
  customersPdf,
  ordersPdf,
  ordersExcel,
  customersExcel,
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/customer/:id/pdf', customerHistoryPdf);
router.get('/daily/pdf', dailyReportPdf);
router.get('/customers/pdf', customersPdf);
router.get('/orders/pdf', ordersPdf);
router.get('/orders/excel', ordersExcel);
router.get('/customers/excel', customersExcel);

export default router;


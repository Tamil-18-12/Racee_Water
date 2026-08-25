import express from 'express';
import {
  createPublicOrder,
  createOrderForCustomer,
  getAllOrders,
  getTodayOrders,
  getOrderById,
  getOrdersByCustomer,
  addPayment,
  addEmptyCanReturn,
  updateStatus,
  deleteOrder,
  getCanStatus,
} from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint for online customer booking
router.post('/public', createPublicOrder);

// Protected endpoints for owner management
router.get('/can-status', authenticateToken, getCanStatus);
router.post('/customer/:customerId', authenticateToken, createOrderForCustomer);
router.get('/today', authenticateToken, getTodayOrders);
router.get('/customer/:customerId', authenticateToken, getOrdersByCustomer);
router.post('/:id/payment', authenticateToken, addPayment);
router.post('/:id/empty-can', authenticateToken, addEmptyCanReturn);
router.put('/:id/status', authenticateToken, updateStatus);
router.get('/:id', authenticateToken, getOrderById);
router.delete('/:id', authenticateToken, deleteOrder);
router.get('/', authenticateToken, getAllOrders);

export default router;

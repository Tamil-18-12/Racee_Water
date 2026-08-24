import express from 'express';
import { getSummary, getTodayOrders } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/today', getTodayOrders);

export default router;

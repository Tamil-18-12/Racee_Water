import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerByMobile,
  searchCustomers,
  updateCustomer,
} from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/search', searchCustomers);
router.get('/mobile/:mobile', getCustomerByMobile);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);

export default router;

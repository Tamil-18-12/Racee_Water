import express from 'express';
import {
  getPublicSettings,
  getSettings,
  updateSettings,
} from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint for customer booking page
router.get('/public', getPublicSettings);

// Protected endpoints for owner settings
router.get('/', authenticateToken, getSettings);
router.put('/', authenticateToken, updateSettings);

export default router;

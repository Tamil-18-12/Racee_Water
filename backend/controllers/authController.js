import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';

export const login = async (req, res, next) => {
  try {
    const { ownerId, password } = req.body;

    if (!ownerId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID and password are required',
        data: null,
      });
    }

    const owner = await Owner.findOne({ ownerId });
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Invalid owner ID or password',
        data: null,
      });
    }

    const isMatch = await owner.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid owner ID or password',
        data: null,
      });
    }

    const secret = process.env.JWT_SECRET || 'd3f4ulTW4t3rC4nD3liv3ryS3cr3tK3y2024V1llag3Bu5in3ss';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      { id: owner._id, ownerId: owner.ownerId, role: owner.role },
      secret,
      { expiresIn }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        ownerId: owner.ownerId,
        role: owner.role || 'ROLE_OWNER',
        message: 'Login successful',
      },
    });
  } catch (err) {
    next(err);
  }
};

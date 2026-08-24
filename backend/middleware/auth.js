import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      data: null,
    });
  }

  const secret = process.env.JWT_SECRET || 'd3f4ulTW4t3rC4nD3liv3ryS3cr3tK3y2024V1llag3Bu5in3ss';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
        data: null,
      });
    }

    req.user = user;
    next();
  });
};

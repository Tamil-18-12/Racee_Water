export const errorHandler = (err, req, res, next) => {
  // Handle body-parser JSON syntax error
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload received',
      data: null,
    });
  }

  console.error('Unhandled Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: errors,
    });
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field || 'field'} already exists.`,
      data: null,
    });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ID format: ${err.value}`,
      data: null,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    data: null,
  });
};

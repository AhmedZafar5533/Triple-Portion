/**
 * Centralized error handling middleware.
 * Catches all errors thrown in the app and returns a sanitized JSON response.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error for developers
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Details:', err);
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    errors: err.errors || null
  });
};

/**
 * 404 Not Found middleware.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };

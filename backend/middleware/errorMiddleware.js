const AppError = require('../utils/AppError');

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let status = err.status || 'error';

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {}).join(', ');
    message = `Duplicate field value: ${field} already exists. Please use another value.`;
    status = 'fail';
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors || {}).map((e) => e.message).join('. ');
    message = messages || 'Validation failed.';
    status = 'fail';
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    status = 'fail';
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      message,
      stack: err.stack,
    });
  } else {
    res.status(statusCode).json({
      status,
      message: err.isOperational ? message : 'Something went wrong',
    });
  }
};

module.exports = errorMiddleware;

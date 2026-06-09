const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  const message = messages.join('. ');
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${field} already exists`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      message: error.message,
      stack: error.stack,
    });
  } else {
    res.status(statusCode).json({
      status,
      message: error.message,
    });
  }
};

module.exports = errorMiddleware;

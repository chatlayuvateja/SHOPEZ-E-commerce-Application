const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateAccessToken } = require('../utils/tokenUtils');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password recently changed. Please log in again.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

const refreshTokenHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError('Refresh token not provided.', 401));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      res.cookie('accessToken', 'none', {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
      res.cookie('refreshToken', 'none', {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
      return next(new AppError('Invalid refresh token.', 403));
    }

    const newAccessToken = generateAccessToken(user._id, user.role);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired refresh token.', 403));
    }
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { protect, refreshTokenHandler, restrictTo };

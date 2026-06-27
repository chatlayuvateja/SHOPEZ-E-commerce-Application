const { verify, generateAccessToken, JWT_SECRET, JWT_REFRESH_SECRET } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    const decoded = verify(token, JWT_SECRET);
    const db = req.db;

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });

    if (!user || !user.isActive) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      if (decoded.iat < changedTimestamp) {
        return next(new AppError('Password recently changed. Please log in again.', 401));
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Invalid signature' || error.message === 'Invalid token format') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.message === 'Token expired') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

const refreshTokenHandler = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(new AppError('Refresh token not provided.', 401));
    }

    const decoded = verify(refreshToken, JWT_REFRESH_SECRET);
    const db = req.db;

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { refreshToken: 1, role: 1, name: 1, email: 1 } }
    );

    if (!user || user.refreshToken !== refreshToken) {
      res.setHeader('Set-Cookie', [
        'accessToken=none; HttpOnly; Path=/; Max-Age=0',
        'refreshToken=none; HttpOnly; Path=/; Max-Age=0',
      ]);
      return next(new AppError('Invalid refresh token.', 403));
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);

    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `accessToken=${newAccessToken}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=900`);

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
    });
  } catch (error) {
    if (error.message === 'Invalid signature' || error.message === 'Token expired' || error.message === 'Invalid token format') {
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

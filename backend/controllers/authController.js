const User = require('../models/User');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');
const { sendTokenResponse } = require('../utils/jwt');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const db = req.db;

    const validRole = role === 'SELLER' ? 'SELLER' : 'USER';

    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 400));
    }

    const hashedPw = await User.hashPassword(password);
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPw,
      role: validRole,
      avatar: '',
      phone: '',
      address: {},
      isActive: true,
      refreshToken: '',
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(userData);
    const user = { ...userData, _id: result.insertedId };

    if (validRole === 'USER') {
      await db.collection('carts').insertOne({ user: user._id, items: [], updatedAt: new Date() });
    }

    await sendTokenResponse(user, 201, res, db);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = req.db;

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (!user || !(await User.comparePassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 403));
    }

    await sendTokenResponse(user, 200, res, db);
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const db = req.db;
    res.setHeader('Set-Cookie', [
      'accessToken=none; HttpOnly; Path=/; Max-Age=0',
      'refreshToken=none; HttpOnly; Path=/; Max-Age=0',
    ]);

    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: { refreshToken: '' } }
    );

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const db = req.db;
    const user = await db.collection('users').findOne(
      { _id: req.user._id },
      { projection: { password: 0, refreshToken: 0 } }
    );

    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = req.db;

    const user = await db.collection('users').findOne({ _id: req.user._id });

    if (!(await User.comparePassword(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    const hashedPw = await User.hashPassword(newPassword);
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: { password: hashedPw, passwordChangedAt: new Date() } }
    );

    const updatedUser = await db.collection('users').findOne({ _id: req.user._id });
    await sendTokenResponse(updatedUser, 200, res, db);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe, updatePassword };

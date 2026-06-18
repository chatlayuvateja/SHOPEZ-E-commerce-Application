const User = require('../models/User');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');
const { sendTokenResponse } = require('../utils/tokenUtils');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 400));
    }

    const user = await User.create({ name, email, password, role });

    await Cart.create({ user: user._id, items: [] });

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated.', 403));
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.cookie('accessToken', 'none', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.cookie('refreshToken', 'none', {
      httpOnly: true,
      expires: new Date(Date.now()),
    });

    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });

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
    const user = await User.findById(req.user._id);

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

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, logoutUser, getMe, updatePassword };

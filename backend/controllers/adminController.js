const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const totalResults = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: users.length,
      totalResults,
      totalPages,
      currentPage: page,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'SELLER', 'ADMIN'].includes(role)) {
      return next(new AppError('Invalid role. Must be USER, SELLER, or ADMIN', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await Product.deleteMany({ seller: user._id });
    await Order.deleteMany({ user: user._id });
    await Review.deleteMany({ user: user._id });
    await Cart.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      status: 'success',
      message: 'User and all associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status.toUpperCase();

    const totalResults = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: orders.length,
      totalResults,
      totalPages,
      currentPage: page,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const totalUsers = userCounts.reduce((sum, r) => sum + (r._id !== 'ADMIN' ? r.count : 0), 0);
    const totalSellers = userCounts.find((r) => r._id === 'SELLER')?.count || 0;

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: 'DELIVERED' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? Math.round(revenueAgg[0].totalRevenue * 100) / 100 : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { orderStatus: 'DELIVERED', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $arrayElemAt: [['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], '$_id.month'] },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
          revenue: { $round: ['$revenue', 2] },
        },
      },
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $project: { status: { $toLower: '$_id' }, count: 1, _id: 0 } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          name: { $first: '$orderItems.name' },
          image: { $first: '$orderItems.image' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          name: 1,
          totalSold: 1,
          revenue: 1,
          images: [{ url: '$image' }],
        },
      },
    ]);

    const activeUsers = await User.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
        activeUsers,
        monthlyRevenue,
        ordersByStatus,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllOrders,
  getDashboardStats,
};

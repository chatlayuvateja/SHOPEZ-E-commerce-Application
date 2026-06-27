const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const getAllUsers = async (req, res, next) => {
  try {
    const db = req.db;
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

    const totalResults = await db.collection('users').countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const users = await db.collection('users')
      .find(filter, { projection: { password: 0, refreshToken: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

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
    const db = req.db;
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const newStatus = !user.isActive;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isActive: newStatus } }
    );

    res.status(200).json({
      status: 'success',
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: newStatus,
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

    const db = req.db;
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role } }
    );

    res.status(200).json({
      status: 'success',
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role,
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
    const db = req.db;
    const userId = new ObjectId(req.params.id);
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await db.collection('products').deleteMany({ seller: userId });
    await db.collection('orders').deleteMany({ user: userId });
    await db.collection('reviews').deleteMany({ user: userId });
    await db.collection('carts').deleteMany({ user: userId });
    await db.collection('users').deleteOne({ _id: userId });

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
    const db = req.db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status.toUpperCase();

    const totalResults = await db.collection('orders').countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate user info
    for (const order of orders) {
      const user = await db.collection('users').findOne(
        { _id: order.user },
        { projection: { name: 1, email: 1 } }
      );
      order.user = user || { name: 'Unknown' };
    }

    const transformOrder = (order) => {
      if (!order) return null;
      const t = { ...order };
      t.orderId = t._id;
      t.status = (t.orderStatus || 'PENDING').toLowerCase();
      t.items = t.orderItems || [];
      t.subtotal = t.itemsPrice;
      t.tax = t.taxPrice;
      t.shippingCost = t.shippingPrice;
      t.total = t.totalPrice;
      delete t.totalPrice;
      delete t.itemsPrice;
      delete t.taxPrice;
      delete t.shippingPrice;
      delete t.orderItems;
      if (t.shippingAddress) {
        t.shippingAddress.zipCode = t.shippingAddress.pincode || t.shippingAddress.zipCode;
        delete t.shippingAddress.pincode;
      }
      return t;
    };

    res.status(200).json({
      status: 'success',
      results: orders.length,
      totalResults,
      totalPages,
      currentPage: page,
      orders: orders.map(transformOrder),
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const db = req.db;

    const userCounts = await db.collection('users').aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]).toArray();

    const totalUsers = userCounts.reduce((sum, r) => sum + (r._id !== 'ADMIN' ? r.count : 0), 0);
    const totalSellers = userCounts.find((r) => r._id === 'SELLER')?.count || 0;

    const totalProducts = await db.collection('products').countDocuments();
    const totalOrders = await db.collection('orders').countDocuments();

    const revenueAgg = await db.collection('orders').aggregate([
      { $match: { orderStatus: 'DELIVERED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]).toArray();
    const totalRevenue = revenueAgg.length > 0 ? Math.round(revenueAgg[0].totalRevenue * 100) / 100 : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await db.collection('orders').aggregate([
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
    ]).toArray();

    const ordersByStatus = await db.collection('orders').aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $project: { status: { $toLower: '$_id' }, count: 1, _id: 0 } },
    ]).toArray();

    const topProducts = await db.collection('orders').aggregate([
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
      { $project: { _id: 1, name: 1, totalSold: 1, revenue: 1, images: [{ url: '$image' }] } },
    ]).toArray();

    const activeUsers = await db.collection('users').countDocuments({ isActive: true });

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

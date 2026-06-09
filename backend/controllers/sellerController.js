const Product = require('../models/Product');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

const getSellerStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const totalProducts = await Product.countDocuments({ seller: sellerId, isActive: true });

    const sellerOrders = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      { $group: { _id: null, uniqueOrders: { $addToSet: '$_id' } } },
    ]);

    const totalOrders = sellerOrders.length > 0 ? sellerOrders[0].uniqueOrders.length : 0;

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: 'DELIVERED' } },
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] },
          },
        },
      },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const ratingAgg = await Product.aggregate([
      { $match: { seller: sellerId, isActive: true, numReviews: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$ratings' },
        },
      },
    ]);

    const averageRating = ratingAgg.length > 0
      ? Math.round(ratingAgg[0].avgRating * 10) / 10
      : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      { $match: { orderStatus: 'DELIVERED', createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
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
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: { $toLower: '$_id' },
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageRating,
        monthlyRevenue,
        ordersByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSellerProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { seller: req.user.id };
    const totalResults = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: products.length,
      totalResults,
      totalPages,
      currentPage: page,
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getSellerOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const matchFilter = { 'orderItems.seller': req.user.id };

    if (req.query.status) {
      matchFilter.orderStatus = req.query.status.toUpperCase();
    }

    const totalResults = await Order.countDocuments(matchFilter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await Order.find(matchFilter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const filteredOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orderItems = orderObj.orderItems.filter(
        (item) => item.seller.toString() === req.user.id
      );
      return orderObj;
    });

    res.status(200).json({
      status: 'success',
      results: filteredOrders.length,
      totalResults,
      totalPages,
      currentPage: page,
      orders: filteredOrders,
    });
  } catch (error) {
    next(error);
  }
};

const updateSellerOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      pending: 'confirmed',
      confirmed: 'shipped',
      shipped: 'delivered',
    };

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const currentStatus = order.orderStatus ? order.orderStatus.toLowerCase() : 'pending';

    if (currentStatus === 'cancelled') {
      return next(new AppError('Cannot update a cancelled order', 400));
    }

    if (currentStatus === 'delivered') {
      return next(new AppError('Order has already been delivered', 400));
    }

    const expectedNext = validTransitions[currentStatus];
    if (!expectedNext || status !== expectedNext) {
      return next(new AppError(`Invalid status transition from ${currentStatus} to ${status}`, 400));
    }

    const hasSellerItem = order.orderItems.some(
      (item) => item.seller.toString() === req.user.id
    );

    if (!hasSellerItem && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this order', 403));
    }

    order.orderStatus = status.toUpperCase();
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    await order.save();

    res.status(200).json({
      status: 'success',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSellerStats,
  getSellerProducts,
  getSellerOrders,
  updateSellerOrderStatus,
};

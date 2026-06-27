const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const VALID_TRANSITIONS = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
};

const getSellerStats = async (req, res, next) => {
  try {
    const db = req.db;
    const sellerId = req.user._id;

    const totalProducts = await db.collection('products').countDocuments({ seller: sellerId, isActive: true });

    const sellerOrders = await db.collection('orders').aggregate([
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      { $group: { _id: null, uniqueOrders: { $addToSet: '$_id' } } },
    ]).toArray();
    const totalOrders = sellerOrders.length > 0 ? sellerOrders[0].uniqueOrders.length : 0;

    const revenueAgg = await db.collection('orders').aggregate([
      { $match: { orderStatus: 'DELIVERED' } },
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
    ]).toArray();
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    const ratingAgg = await db.collection('products').aggregate([
      { $match: { seller: sellerId, isActive: true, numReviews: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$ratings' } } },
    ]).toArray();
    const averageRating = ratingAgg.length > 0 ? Math.round(ratingAgg[0].avgRating * 10) / 10 : 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await db.collection('orders').aggregate([
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
    ]).toArray();

    const ordersByStatus = await db.collection('orders').aggregate([
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.seller': sellerId } },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $project: { status: { $toLower: '$_id' }, count: 1, _id: 0 } },
    ]).toArray();

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
    const db = req.db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { seller: new ObjectId(req.user._id) };
    const totalResults = await db.collection('products').countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Add finalPrice
    products.forEach((p) => {
      p.finalPrice = Math.round((p.price * (1 - (p.discountPercent || 0) / 100)) * 100) / 100;
    });

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
    const db = req.db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const matchFilter = { 'orderItems.seller': new ObjectId(req.user._id) };
    if (req.query.status) {
      matchFilter.orderStatus = req.query.status.toUpperCase();
    }

    const totalResults = await db.collection('orders').countDocuments(matchFilter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await db.collection('orders')
      .find(matchFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Filter items to only show seller's items and populate user
    const filteredOrders = [];
    for (const order of orders) {
      const user = await db.collection('users').findOne(
        { _id: order.user },
        { projection: { name: 1, email: 1 } }
      );
      const orderObj = { ...order, user: user || { name: 'Unknown' } };
      orderObj.orderItems = orderObj.orderItems.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      );
      filteredOrders.push(orderObj);
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
      return t;
    };

    res.status(200).json({
      status: 'success',
      results: filteredOrders.length,
      totalResults,
      totalPages,
      currentPage: page,
      orders: filteredOrders.map(transformOrder),
    });
  } catch (error) {
    next(error);
  }
};

const updateSellerOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const db = req.db;

    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const currentStatus = (order.orderStatus || 'PENDING').toLowerCase();

    if (currentStatus === 'cancelled') {
      return next(new AppError('Cannot update a cancelled order', 400));
    }
    if (currentStatus === 'delivered') {
      return next(new AppError('Order has already been delivered', 400));
    }

    const expectedNext = VALID_TRANSITIONS[currentStatus];
    if (!expectedNext || status !== expectedNext) {
      return next(new AppError(`Invalid status transition from ${currentStatus} to ${status}`, 400));
    }

    const hasSellerItem = order.orderItems.some(
      (item) => item.seller.toString() === req.user._id.toString()
    );
    if (!hasSellerItem && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this order', 403));
    }

    const update = { $set: { orderStatus: status.toUpperCase() } };
    if (status === 'delivered') {
      update.$set.deliveredAt = new Date();
    }

    await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      update
    );

    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

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
      return t;
    };

    res.status(200).json({
      status: 'success',
      order: transformOrder(updatedOrder),
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

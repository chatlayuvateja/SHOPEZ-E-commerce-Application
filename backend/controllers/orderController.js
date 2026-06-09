const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');

const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, phone } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price discountPercent stock images isActive seller');

    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return next(new AppError('Complete shipping address is required', 400));
    }

    if (!paymentMethod) {
      return next(new AppError('Payment method is required', 400));
    }

    const itemsWithPrices = [];
    const paymentMethodMap = { cod: 'COD', upi: 'UPI', card: 'CARD', netbanking: 'NETBANKING' };
    const normalizedPayment = paymentMethodMap[paymentMethod] || paymentMethod;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product || !product.isActive) {
        return next(new AppError(`Product "${product?.name || 'unknown'}" is no longer available`, 400));
      }

      if (product.stock < cartItem.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
      }

      const finalPrice = Math.round((product.price * (1 - (product.discountPercent || 0) / 100)) * 100) / 100;

      itemsWithPrices.push({
        product: product._id,
        name: product.name,
        image: product.images && product.images.length > 0 ? product.images[0].url : '',
        price: finalPrice,
        quantity: cartItem.quantity,
        seller: product.seller,
      });
    }

    const itemsPrice = Math.round(itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
    const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
    const shippingPrice = itemsPrice >= 999 ? 0 : 99;
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

    for (const item of itemsWithPrices) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!result) {
        throw new AppError(`Failed to deduct stock for ${item.name}. Item may be out of stock.`, 400);
      }
    }

    const isPaid = normalizedPayment !== 'COD';
    const order = await Order.create({
      user: req.user.id,
      orderItems: itemsWithPrices,
      shippingAddress: {
        ...shippingAddress,
        pincode: shippingAddress.zipCode,
        zipCode: undefined,
      },
      phone: phone || '',
      paymentMethod: normalizedPayment,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: isPaid ? Date.now() : undefined,
    });

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    const populatedOrder = await Order.findById(order._id)
      .populate('orderItems.product', 'name images')
      .populate('orderItems.seller', 'name');

    res.status(201).json({
      status: 'success',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    const totalResults = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await Order.find(filter)
      .populate('orderItems.product', 'name images')
      .populate('orderItems.seller', 'name')
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

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price')
      .populate('orderItems.seller', 'name');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SELLER') {
      return next(new AppError('You do not have permission to view this order', 403));
    }

    if (req.user.role === 'SELLER') {
      const hasSellerItems = order.orderItems.some(
        (item) => item.seller._id.toString() === req.user.id
      );
      if (!hasSellerItems && req.user.role !== 'ADMIN') {
        return next(new AppError('You do not have permission to view this order', 403));
      }
    }

    res.status(200).json({
      status: 'success',
      order,
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to cancel this order', 403));
    }

    if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'CONFIRMED') {
      return next(new AppError('Order can only be cancelled if it is PENDING or CONFIRMED', 400));
    }

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancelReason = req.body.cancelReason || '';
    await order.save();

    res.status(200).json({
      status: 'success',
      order,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'SHIPPED',
      SHIPPED: 'DELIVERED',
    };

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.orderStatus === 'CANCELLED') {
      return next(new AppError('Cannot update a cancelled order', 400));
    }

    if (order.orderStatus === 'DELIVERED') {
      return next(new AppError('Order has already been delivered', 400));
    }

    const expectedNext = validTransitions[order.orderStatus];
    if (!expectedNext || status !== expectedNext) {
      return next(new AppError(`Invalid status transition from ${order.orderStatus} to ${status}`, 400));
    }

    order.orderStatus = status;
    if (status === 'DELIVERED') {
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
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};

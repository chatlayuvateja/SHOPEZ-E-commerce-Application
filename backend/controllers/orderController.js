const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const VALID_TRANSITIONS = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

const transformOrder = (order) => {
  if (!order) return null;
  const transformed = { ...order };
  transformed.orderId = transformed._id;
  transformed.status = (transformed.orderStatus || 'PENDING').toLowerCase();
  transformed.items = transformed.orderItems || [];
  transformed.subtotal = transformed.itemsPrice;
  transformed.tax = transformed.taxPrice;
  transformed.shippingCost = transformed.shippingPrice;
  transformed.total = transformed.totalPrice;
  delete transformed.totalPrice;
  delete transformed.itemsPrice;
  delete transformed.taxPrice;
  delete transformed.shippingPrice;
  delete transformed.orderItems;
  if (transformed.shippingAddress) {
    transformed.shippingAddress.zipCode = transformed.shippingAddress.pincode || transformed.shippingAddress.zipCode;
    delete transformed.shippingAddress.pincode;
  }
  return transformed;
};

const createOrder = async (req, res, next) => {
  try {
    const db = req.db;
    const { shippingAddress, paymentMethod, phone } = req.body;

    const cart = await db.collection('carts').findOne({ user: new ObjectId(req.user._id) });
    if (!cart || !cart.items || cart.items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return next(new AppError('Complete shipping address is required', 400));
    }

    if (!paymentMethod) {
      return next(new AppError('Payment method is required', 400));
    }

    // Get product details for all items in cart
    const productIds = cart.items.map((item) => new ObjectId(item.product));
    const products = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .toArray();
    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });

    const itemsWithPrices = [];
    for (const cartItem of cart.items) {
      const product = productMap[cartItem.product.toString()];
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

    // Deduct stock
    for (const item of itemsWithPrices) {
      const result = await db.collection('products').findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: 'after' }
      );
      if (!result) {
        // Restock previous items
        for (const prevItem of itemsWithPrices) {
          if (prevItem.product.toString() === item.product.toString()) break;
          await db.collection('products').updateOne(
            { _id: prevItem.product },
            { $inc: { stock: prevItem.quantity } }
          );
        }
        throw new AppError(`Failed to deduct stock for ${item.name}. Item may be out of stock.`, 400);
      }
    }

    const paymentMethodMap = { cod: 'COD', upi: 'UPI', card: 'CARD', netbanking: 'NETBANKING' };
    const normalizedPayment = paymentMethodMap[paymentMethod] || paymentMethod.toUpperCase();
    const isPaid = normalizedPayment !== 'COD';

    const orderData = {
      user: new ObjectId(req.user._id),
      orderItems: itemsWithPrices.map((item) => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        seller: item.seller,
      })),
      shippingAddress: {
        fullName: shippingAddress.fullName || '',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.zipCode,
        country: shippingAddress.country,
      },
      phone: phone || '',
      paymentMethod: normalizedPayment,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt: isPaid ? new Date() : null,
      orderStatus: 'PENDING',
      deliveredAt: null,
      cancelReason: '',
      createdAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderData);
    await db.collection('carts').updateOne(
      { user: new ObjectId(req.user._id) },
      { $set: { items: [], updatedAt: new Date() } }
    );

    const order = await db.collection('orders').findOne({ _id: result.insertedId });

    // Populate references
    if (order.orderItems && order.orderItems.length > 0) {
      const prodIds = [...new Set(order.orderItems.map((i) => i.product.toString()))];
      const prods = await db.collection('products')
        .find({ _id: { $in: prodIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1, images: 1 })
        .toArray();
      const pMap = {};
      prods.forEach((p) => { pMap[p._id.toString()] = p; });
      order.orderItems.forEach((item) => {
        item.product = pMap[item.product.toString()] || { name: item.name };
      });
    }

    res.status(201).json({
      status: 'success',
      order: transformOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const db = req.db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: new ObjectId(req.user._id) };
    const totalResults = await db.collection('orders').countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const orders = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate product references
    for (const order of orders) {
      if (order.orderItems && order.orderItems.length > 0) {
        const prodIds = [...new Set(order.orderItems.map((i) => i.product.toString()))];
        const prods = await db.collection('products')
          .find({ _id: { $in: prodIds.map((id) => new ObjectId(id)) } })
          .project({ name: 1, images: 1 })
          .toArray();
        const pMap = {};
        prods.forEach((p) => { pMap[p._id.toString()] = p; });
        order.orderItems.forEach((item) => {
          item.product = pMap[item.product.toString()] || { name: item.name };
        });
      }
    }

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

const getOrderById = async (req, res, next) => {
  try {
    const db = req.db;
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN' && req.user.role !== 'SELLER') {
      return next(new AppError('You do not have permission to view this order', 403));
    }

    if (req.user.role === 'SELLER') {
      const hasSellerItems = order.orderItems.some(
        (item) => item.seller && item.seller.toString() === req.user._id.toString()
      );
      if (!hasSellerItems) {
        return next(new AppError('You do not have permission to view this order', 403));
      }
    }

    // Populate references
    if (order.orderItems && order.orderItems.length > 0) {
      const prodIds = [...new Set(order.orderItems.map((i) => i.product.toString()))];
      const prods = await db.collection('products')
        .find({ _id: { $in: prodIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1, images: 1, price: 1 })
        .toArray();
      const pMap = {};
      prods.forEach((p) => { pMap[p._id.toString()] = p; });
      order.orderItems.forEach((item) => {
        item.product = pMap[item.product.toString()] || { name: item.name };
      });
    }

    // Populate user
    const user = await db.collection('users').findOne(
      { _id: order.user },
      { projection: { name: 1, email: 1 } }
    );
    order.user = user || { name: 'Unknown' };

    res.status(200).json({
      status: 'success',
      order: transformOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const db = req.db;
    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to cancel this order', 403));
    }

    if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'CONFIRMED') {
      return next(new AppError('Order can only be cancelled if it is PENDING or CONFIRMED', 400));
    }

    // Restock items
    for (const item of order.orderItems) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(item.product) },
        { $inc: { stock: item.quantity } }
      );
    }

    const cancelReason = req.body.cancelReason || '';
    await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { orderStatus: 'CANCELLED', cancelReason } }
    );

    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

    res.status(200).json({
      status: 'success',
      order: transformOrder(updatedOrder),
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const db = req.db;

    const order = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.orderStatus === 'CANCELLED') {
      return next(new AppError('Cannot update a cancelled order', 400));
    }

    if (order.orderStatus === 'DELIVERED') {
      return next(new AppError('Order has already been delivered', 400));
    }

    const expectedNext = VALID_TRANSITIONS[order.orderStatus];
    if (!expectedNext || status !== expectedNext) {
      return next(new AppError(`Invalid status transition from ${order.orderStatus} to ${status}`, 400));
    }

    const update = { $set: { orderStatus: status } };
    if (status === 'DELIVERED') {
      update.$set.deliveredAt = new Date();
    }

    await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      update
    );

    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(req.params.id) });

    res.status(200).json({
      status: 'success',
      order: transformOrder(updatedOrder),
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

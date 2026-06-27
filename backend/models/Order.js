const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const collectionName = 'orders';

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const VALID_PAYMENT_METHODS = ['COD', 'UPI', 'CARD', 'NETBANKING'];

const Order = {
  collectionName,

  async initCollection(db) {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      const col = db.collection(collectionName);
      await col.createIndex({ user: 1, createdAt: -1 });
      await col.createIndex({ orderStatus: 1 });
      await col.createIndex({ 'orderItems.seller': 1 });
    }
  },

  async findById(id) {
    const db = getDB();
    return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  },

  async findOne(filter) {
    const db = getDB();
    return db.collection(collectionName).findOne(filter);
  },

  async find(filter, options = {}) {
    const db = getDB();
    let cursor = db.collection(collectionName).find(filter);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor.toArray();
  },

  async countDocuments(filter = {}) {
    const db = getDB();
    return db.collection(collectionName).countDocuments(filter);
  },

  async create(orderData) {
    const db = getDB();
    const order = {
      user: new ObjectId(orderData.user),
      orderItems: (orderData.orderItems || []).map((item) => ({
        product: new ObjectId(item.product),
        name: item.name,
        image: item.image || '',
        price: item.price,
        quantity: item.quantity,
        seller: new ObjectId(item.seller),
      })),
      shippingAddress: orderData.shippingAddress,
      phone: orderData.phone || '',
      paymentMethod: orderData.paymentMethod,
      paymentResult: orderData.paymentResult || null,
      itemsPrice: orderData.itemsPrice,
      taxPrice: orderData.taxPrice,
      shippingPrice: orderData.shippingPrice,
      totalPrice: orderData.totalPrice,
      isPaid: orderData.isPaid || false,
      paidAt: orderData.paidAt || null,
      orderStatus: 'PENDING',
      deliveredAt: null,
      cancelReason: '',
      createdAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(order);
    return { ...order, _id: result.insertedId };
  },

  async findByIdAndUpdate(id, updateData) {
    const db = getDB();
    const update = { $set: {} };
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id') {
        if (key === 'user' || key === 'product') {
          update.$set[key] = new ObjectId(updateData[key]);
        } else {
          update.$set[key] = updateData[key];
        }
      }
    });
    return db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );
  },

  async aggregate(pipeline) {
    const db = getDB();
    return db.collection(collectionName).aggregate(pipeline).toArray();
  },

  async deleteMany(filter) {
    const db = getDB();
    return db.collection(collectionName).deleteMany(filter);
  },

  VALID_STATUSES,
  VALID_PAYMENT_METHODS,

  // Transform order for JSON response (similar to mongoose toJSON transform)
  transformOrder(order) {
    if (!order) return null;
    return {
      ...order,
      orderId: order._id,
      status: order.orderStatus ? order.orderStatus.toLowerCase() : 'pending',
      items: order.orderItems || [],
      subtotal: order.itemsPrice,
      tax: order.taxPrice,
      shippingCost: order.shippingPrice,
      total: order.totalPrice,
      shippingAddress: order.shippingAddress ? {
        ...order.shippingAddress,
        zipCode: order.shippingAddress.pincode || order.shippingAddress.zipCode,
      } : order.shippingAddress,
    };
  },
};

module.exports = Order;

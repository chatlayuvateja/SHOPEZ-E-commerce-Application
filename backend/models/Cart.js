const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const collectionName = 'carts';

const Cart = {
  collectionName,

  async initCollection(db) {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      const col = db.collection(collectionName);
      await col.createIndex({ user: 1 }, { unique: true });
    }
  },

  async findOne(filter) {
    const db = getDB();
    return db.collection(collectionName).findOne(filter);
  },

  async findOneAndUpdate(filter, update, options = {}) {
    const db = getDB();
    return db.collection(collectionName).findOneAndUpdate(filter, update, { returnDocument: 'after', ...options });
  },

  async create(cartData) {
    const db = getDB();
    const cart = {
      user: new ObjectId(cartData.user),
      items: (cartData.items || []).map((item) => ({
        product: new ObjectId(item.product),
        quantity: item.quantity || 1,
        priceAtAdd: item.priceAtAdd || 0,
      })),
      updatedAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(cart);
    return { ...cart, _id: result.insertedId };
  },

  async deleteMany(filter) {
    const db = getDB();
    return db.collection(collectionName).deleteMany(filter);
  },
};

module.exports = Cart;

const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const collectionName = 'products';

const VALID_CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Groceries', 'Jewelry', 'Music', 'Other'];

const Product = {
  collectionName,

  async initCollection(db) {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      const col = db.collection(collectionName);
      await col.createIndex({ seller: 1 });
      await col.createIndex({ category: 1 });
      await col.createIndex({ ratings: -1 });
      await col.createIndex({ slug: 1 }, { unique: true });
      await col.createIndex({ isActive: 1 });
    }
  },

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  },

  calculateFinalPrice(price, discountPercent) {
    const discount = price * ((discountPercent || 0) / 100);
    return Math.round((price - discount) * 100) / 100;
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

  async create(productData) {
    const db = getDB();
    const slug = this.generateSlug(productData.name);
    const product = {
      seller: productData.seller ? new ObjectId(productData.seller) : null,
      name: productData.name,
      slug,
      description: productData.description,
      category: productData.category,
      brand: productData.brand || '',
      price: productData.price,
      discountPercent: productData.discountPercent || 0,
      stock: productData.stock || 0,
      images: productData.images || [],
      ratings: 0,
      numReviews: 0,
      isFeatured: productData.isFeatured || false,
      isActive: true,
      createdAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(product);
    return { ...product, _id: result.insertedId };
  },

  async findByIdAndUpdate(id, updateData) {
    const db = getDB();
    const update = { $set: {} };
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id') {
        if (key === 'seller') {
          update.$set[key] = new ObjectId(updateData[key]);
        } else {
          update.$set[key] = updateData[key];
        }
      }
    });
    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );
    return result;
  },

  async findOneAndUpdate(filter, update) {
    const db = getDB();
    return db.collection(collectionName).findOneAndUpdate(filter, update, { returnDocument: 'after' });
  },

  async aggregate(pipeline) {
    const db = getDB();
    return db.collection(collectionName).aggregate(pipeline).toArray();
  },

  async deleteMany(filter) {
    const db = getDB();
    return db.collection(collectionName).deleteMany(filter);
  },

  VALID_CATEGORIES,
};

module.exports = Product;

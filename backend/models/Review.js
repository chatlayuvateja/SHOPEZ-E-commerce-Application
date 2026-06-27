const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const collectionName = 'reviews';

const Review = {
  collectionName,

  async initCollection(db) {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName);
      const col = db.collection(collectionName);
      await col.createIndex({ user: 1, product: 1 }, { unique: true });
      await col.createIndex({ product: 1 });
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

  async create(reviewData) {
    const db = getDB();
    const review = {
      user: new ObjectId(reviewData.user),
      product: new ObjectId(reviewData.product),
      rating: reviewData.rating,
      title: reviewData.title || '',
      comment: reviewData.comment,
      isVerifiedPurchase: reviewData.isVerifiedPurchase || false,
      createdAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(review);
    return { ...review, _id: result.insertedId };
  },

  async findByIdAndDelete(id) {
    const db = getDB();
    return db.collection(collectionName).findOneAndDelete({ _id: new ObjectId(id) });
  },

  async deleteMany(filter) {
    const db = getDB();
    return db.collection(collectionName).deleteMany(filter);
  },

  async calcAverageRatings(productId) {
    const db = getDB();
    const stats = await db.collection(collectionName).aggregate([
      { $match: { product: new ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]).toArray();

    const productsCollection = db.collection('products');
    if (stats.length > 0) {
      await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: { ratings: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].numReviews } }
      );
    } else {
      await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: { ratings: 0, numReviews: 0 } }
      );
    }
  },
};

module.exports = Review;

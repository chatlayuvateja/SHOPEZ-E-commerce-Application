const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const createReview = async (req, res, next) => {
  try {
    const db = req.db;
    const { product: productId, rating, title, comment } = req.body;

    const existingReview = await db.collection('reviews').findOne({
      user: new ObjectId(req.user._id),
      product: new ObjectId(productId),
    });
    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    const hasDeliveredOrder = await db.collection('orders').findOne({
      user: new ObjectId(req.user._id),
      orderStatus: 'DELIVERED',
      'orderItems.product': new ObjectId(productId),
    });

    const reviewData = {
      user: new ObjectId(req.user._id),
      product: new ObjectId(productId),
      rating,
      title: title || '',
      comment,
      isVerifiedPurchase: !!hasDeliveredOrder,
      createdAt: new Date(),
    };

    const result = await db.collection('reviews').insertOne(reviewData);
    const review = { ...reviewData, _id: result.insertedId };

    // Update product ratings
    const stats = await db.collection('reviews').aggregate([
      { $match: { product: new ObjectId(productId) } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]).toArray();

    if (stats.length > 0) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(productId) },
        { $set: { ratings: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].numReviews } }
      );
    }

    // Populate user
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { name: 1, avatar: 1 } }
    );
    review.user = user || { name: 'Anonymous' };

    res.status(201).json({
      status: 'success',
      review,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const db = req.db;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { product: new ObjectId(req.params.productId) };
    const totalResults = await db.collection('reviews').countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const reviews = await db.collection('reviews')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate user info for each review
    for (const review of reviews) {
      const user = await db.collection('users').findOne(
        { _id: review.user },
        { projection: { name: 1, avatar: 1 } }
      );
      review.user = user || { name: 'Anonymous' };
    }

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      totalResults,
      totalPages,
      currentPage: page,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const db = req.db;
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(req.params.id) });

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to delete this review', 403));
    }

    const productId = review.product;
    await db.collection('reviews').deleteOne({ _id: new ObjectId(req.params.id) });

    // Update product ratings
    const stats = await db.collection('reviews').aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]).toArray();

    if (stats.length > 0) {
      await db.collection('products').updateOne(
        { _id: productId },
        { $set: { ratings: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].numReviews } }
      );
    } else {
      await db.collection('products').updateOne(
        { _id: productId },
        { $set: { ratings: 0, numReviews: 0 } }
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview,
};

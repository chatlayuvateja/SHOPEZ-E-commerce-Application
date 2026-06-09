const Review = require('../models/Review');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

const createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment } = req.body;

    const existingReview = await Review.findOne({ user: req.user.id, product });
    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    const hasDeliveredOrder = await Order.findOne({
      user: req.user.id,
      orderStatus: 'DELIVERED',
      'orderItems.product': product,
    });

    const review = await Review.create({
      user: req.user.id,
      product,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!hasDeliveredOrder,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar');

    res.status(201).json({
      status: 'success',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalResults = await Review.countDocuments({ product: req.params.productId });
    const totalPages = Math.ceil(totalResults / limit);

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to delete this review', 403));
    }

    await Review.findByIdAndDelete(req.params.id);

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

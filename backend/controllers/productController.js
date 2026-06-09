const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.brand) {
      filter.brand = { $regex: req.query.brand, $options: 'i' };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    if (req.query.rating) {
      filter.ratings = { $gte: parseFloat(req.query.rating) };
    }

    if (req.query.featured === 'true') {
      filter.isFeatured = true;
    }

    let sort = {};
    switch (req.query.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'rating':
        sort = { ratings: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const totalResults = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const products = await Product.find(filter)
      .populate('seller', 'name')
      .sort(sort)
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

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('seller', 'name email');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      product,
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('seller', 'name')
      .sort({ ratings: -1 })
      .limit(8);

    res.status(200).json({
      status: 'success',
      results: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      status: 'success',
      categories,
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    req.body.seller = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.seller.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this product', 403));
    }

    const allowedFields = ['name', 'description', 'category', 'brand', 'price', 'discountPercent', 'stock', 'images', 'isFeatured', 'isActive'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      status: 'success',
      product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.seller.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to delete this product', 403));
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};

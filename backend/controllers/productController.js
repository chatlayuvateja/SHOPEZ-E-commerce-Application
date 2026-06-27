const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const VALID_CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Groceries', 'Jewelry', 'Music', 'Other'];

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();
};

const getAllProducts = async (req, res, next) => {
  try {
    const db = req.db;
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

    let sort = { createdAt: -1 };
    switch (req.query.sort) {
      case 'price-asc': sort = { price: 1 }; break;
      case 'price-desc': sort = { price: -1 }; break;
      case 'rating': sort = { ratings: -1 }; break;
      case 'newest': sort = { createdAt: -1 }; break;
    }

    const totalResults = await db.collection('products').countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);

    const products = await db.collection('products')
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate seller names
    const sellerIds = [...new Set(products.map((p) => p.seller?.toString()).filter(Boolean))];
    const sellers = await db.collection('users')
      .find({ _id: { $in: sellerIds.map((id) => new ObjectId(id)) } })
      .project({ name: 1 })
      .toArray();
    const sellerMap = {};
    sellers.forEach((s) => { sellerMap[s._id.toString()] = s; });

    const productsWithSeller = products.map((p) => ({
      ...p,
      finalPrice: Math.round((p.price * (1 - (p.discountPercent || 0) / 100)) * 100) / 100,
      seller: sellerMap[p.seller?.toString()] || { name: 'Unknown' },
    }));

    // Add virtual finalPrice
    productsWithSeller.forEach((p) => {
      if (p.finalPrice === undefined) {
        p.finalPrice = Math.round((p.price * (1 - (p.discountPercent || 0) / 100)) * 100) / 100;
      }
    });

    res.status(200).json({
      status: 'success',
      results: productsWithSeller.length,
      totalResults,
      totalPages,
      currentPage: page,
      products: productsWithSeller,
    });
  } catch (error) {
    next(error);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const db = req.db;
    const product = await db.collection('products').findOne({ slug: req.params.slug, isActive: true });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Populate seller
    if (product.seller) {
      const seller = await db.collection('users').findOne(
        { _id: product.seller },
        { projection: { name: 1, email: 1 } }
      );
      product.seller = seller || { name: 'Unknown' };
    }

    product.finalPrice = Math.round((product.price * (1 - (product.discountPercent || 0) / 100)) * 100) / 100;

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
    const db = req.db;
    const products = await db.collection('products')
      .find({ isFeatured: true, isActive: true })
      .sort({ ratings: -1 })
      .limit(8)
      .toArray();

    // Add finalPrice
    products.forEach((p) => {
      p.finalPrice = Math.round((p.price * (1 - (p.discountPercent || 0) / 100)) * 100) / 100;
    });

    // Populate seller names
    const sellerIds = [...new Set(products.map((p) => p.seller?.toString()).filter(Boolean))];
    if (sellerIds.length > 0) {
      const sellers = await db.collection('users')
        .find({ _id: { $in: sellerIds.map((id) => new ObjectId(id)) } })
        .project({ name: 1 })
        .toArray();
      const sellerMap = {};
      sellers.forEach((s) => { sellerMap[s._id.toString()] = s; });
      products.forEach((p) => {
        p.seller = sellerMap[p.seller?.toString()] || { name: 'Unknown' };
      });
    }

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
    const db = req.db;
    const categories = await db.collection('products').aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]).toArray();

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
    const db = req.db;
    const slug = generateSlug(req.body.name);

    const product = {
      seller: new ObjectId(req.user._id),
      name: req.body.name,
      slug,
      description: req.body.description,
      category: req.body.category,
      brand: req.body.brand || '',
      price: req.body.price,
      discountPercent: req.body.discountPercent || 0,
      stock: req.body.stock || 0,
      images: req.body.images || [],
      ratings: 0,
      numReviews: 0,
      isFeatured: req.body.isFeatured || false,
      isActive: true,
      createdAt: new Date(),
    };

    const result = await db.collection('products').insertOne(product);
    product._id = result.insertedId;
    product.finalPrice = Math.round((product.price * (1 - (product.discountPercent || 0) / 100)) * 100) / 100;

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
    const db = req.db;
    const productId = req.params.id;
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to update this product', 403));
    }

    const allowedFields = ['name', 'description', 'category', 'brand', 'price', 'discountPercent', 'stock', 'images', 'isFeatured', 'isActive'];
    const update = { $set: {} };

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update.$set[field] = req.body[field];
      }
    });

    if (update.$set.name) {
      update.$set.slug = generateSlug(update.$set.name);
    }

    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(productId) },
      update,
      { returnDocument: 'after' }
    );

    result.finalPrice = Math.round((result.price * (1 - (result.discountPercent || 0) / 100)) * 100) / 100;

    res.status(200).json({
      status: 'success',
      product: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const db = req.db;
    const productId = req.params.id;
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return next(new AppError('You do not have permission to delete this product', 403));
    }

    await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: { isActive: false } }
    );

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

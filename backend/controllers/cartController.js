const AppError = require('../utils/AppError');
const { ObjectId } = require('mongodb');

const getCart = async (req, res, next) => {
  try {
    const db = req.db;
    let cart = await db.collection('carts').findOne({ user: new ObjectId(req.user._id) });

    if (!cart) {
      cart = { user: new ObjectId(req.user._id), items: [], updatedAt: new Date() };
      const result = await db.collection('carts').insertOne(cart);
      cart._id = result.insertedId;
    }

    // Populate product info
    if (cart.items && cart.items.length > 0) {
      const productIds = cart.items.map((item) => new ObjectId(item.product));
      const products = await db.collection('products')
        .find({ _id: { $in: productIds } })
        .project({ name: 1, images: 1, price: 1, discountPercent: 1, stock: 1, isActive: 1 })
        .toArray();
      const productMap = {};
      products.forEach((p) => { productMap[p._id.toString()] = p; });
      cart.items.forEach((item) => {
        item.product = productMap[item.product.toString()] || item.product;
      });
    }

    res.status(200).json({
      status: 'success',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const db = req.db;
    const { product: productId, quantity = 1 } = req.body;

    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product || !product.isActive) {
      return next(new AppError('Product not found or unavailable', 404));
    }
    if (product.stock < 1) {
      return next(new AppError('Product is out of stock', 400));
    }

    let cart = await db.collection('carts').findOne({ user: new ObjectId(req.user._id) });
    if (!cart) {
      cart = { user: new ObjectId(req.user._id), items: [], updatedAt: new Date() };
      const result = await db.collection('carts').insertOne(cart);
      cart._id = result.insertedId;
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return next(new AppError(`Cannot add more than ${product.stock} items`, 400));
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      const finalPrice = Math.round((product.price * (1 - (product.discountPercent || 0) / 100)) * 100) / 100;
      cart.items.push({
        product: new ObjectId(productId),
        quantity,
        priceAtAdd: finalPrice || product.price,
      });
    }

    cart.updatedAt = new Date();
    await db.collection('carts').updateOne(
      { _id: cart._id },
      { $set: { items: cart.items, updatedAt: cart.updatedAt } }
    );

    // Repopulate
    const productIds = cart.items.map((item) => new ObjectId(item.product));
    const products = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .project({ name: 1, images: 1, price: 1, discountPercent: 1, stock: 1, isActive: 1 })
      .toArray();
    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });
    cart.items.forEach((item) => {
      item.product = productMap[item.product.toString()] || item.product;
    });

    res.status(200).json({
      status: 'success',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const db = req.db;
    const { product: productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }

    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    if (quantity > product.stock) {
      return next(new AppError(`Only ${product.stock} items available in stock`, 400));
    }

    const cart = await db.collection('carts').findOne({ user: new ObjectId(req.user._id) });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
    if (itemIndex === -1) {
      return next(new AppError('Item not found in cart', 404));
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = new Date();
    await db.collection('carts').updateOne(
      { _id: cart._id },
      { $set: { items: cart.items, updatedAt: cart.updatedAt } }
    );

    // Repopulate
    const productIds = cart.items.map((item) => new ObjectId(item.product));
    const products = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .project({ name: 1, images: 1, price: 1, discountPercent: 1, stock: 1, isActive: 1 })
      .toArray();
    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });
    cart.items.forEach((item) => {
      item.product = productMap[item.product.toString()] || item.product;
    });

    res.status(200).json({
      status: 'success',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const db = req.db;
    const cart = await db.collection('carts').findOne({ user: new ObjectId(req.user._id) });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    cart.updatedAt = new Date();
    await db.collection('carts').updateOne(
      { _id: cart._id },
      { $set: { items: cart.items, updatedAt: cart.updatedAt } }
    );

    // Repopulate
    const productIds = cart.items.map((item) => new ObjectId(item.product));
    const products = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .project({ name: 1, images: 1, price: 1, discountPercent: 1, stock: 1, isActive: 1 })
      .toArray();
    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });
    cart.items.forEach((item) => {
      item.product = productMap[item.product.toString()] || item.product;
    });

    res.status(200).json({
      status: 'success',
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const db = req.db;
    const result = await db.collection('carts').findOneAndUpdate(
      { user: new ObjectId(req.user._id) },
      { $set: { items: [], updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return next(new AppError('Cart not found', 404));
    }

    res.status(200).json({
      status: 'success',
      cart: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

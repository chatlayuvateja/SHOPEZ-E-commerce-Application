const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product', 'name images price discountPercent stock isActive');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
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
    const { product: productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return next(new AppError('Product not found or unavailable', 404));
    }

    if (product.stock < 1) {
      return next(new AppError('Product is out of stock', 400));
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQty = existingItem.quantity + (quantity || 1);
      if (newQty > product.stock) {
        return next(new AppError(`Cannot add more than ${product.stock} items`, 400));
      }
      existingItem.quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
        priceAtAdd: product.finalPrice !== undefined ? product.finalPrice : product.price,
      });
    }

    await cart.save();

    await cart.populate('items.product', 'name images price discountPercent stock isActive');

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
    const { product: productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (quantity > product.stock) {
      return next(new AppError(`Only ${product.stock} items available in stock`, 400));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return next(new AppError('Item not found in cart', 404));
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate('items.product', 'name images price discountPercent stock isActive');

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
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    await cart.populate('items.product', 'name images price discountPercent stock isActive');

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
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { new: true }
    );

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    res.status(200).json({
      status: 'success',
      cart,
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

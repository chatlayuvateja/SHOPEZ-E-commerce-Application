const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Cart item must reference a product'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  priceAtAdd: {
    type: Number,
    required: [true, 'Price at time of add is required'],
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cart must belong to a user'],
    unique: true,
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.pre('save', function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Cart', cartSchema);

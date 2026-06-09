const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Order item must reference a product'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  image: {
    type: String,
    required: [true, 'Product image is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order item must reference a seller'],
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user'],
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String },
    street: { type: String, required: [true, 'Street is required'] },
    city: { type: String, required: [true, 'City is required'] },
    state: { type: String, required: [true, 'State is required'] },
    pincode: { type: String, required: [true, 'Pincode is required'] },
    country: { type: String, required: [true, 'Country is required'] },
  },
  phone: { type: String },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['COD', 'UPI', 'CARD', 'NETBANKING'],
      message: '{VALUE} is not a valid payment method',
    },
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    updateTime: { type: String },
  },
  itemsPrice: {
    type: Number,
    required: [true, 'Items price is required'],
  },
  taxPrice: {
    type: Number,
    required: [true, 'Tax price is required'],
  },
  shippingPrice: {
    type: Number,
    required: [true, 'Shipping price is required'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  orderStatus: {
    type: String,
    enum: {
      values: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      message: '{VALUE} is not a valid order status',
    },
    default: 'PENDING',
  },
  deliveredAt: {
    type: Date,
  },
  cancelReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

orderSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.orderId = ret._id;
    ret.status = ret.orderStatus ? ret.orderStatus.toLowerCase() : 'pending';
    delete ret.orderStatus;
    ret.items = ret.orderItems;
    delete ret.orderItems;
    ret.subtotal = ret.itemsPrice;
    delete ret.itemsPrice;
    ret.tax = ret.taxPrice;
    delete ret.taxPrice;
    ret.shippingCost = ret.shippingPrice;
    delete ret.shippingPrice;
    ret.total = ret.totalPrice;
    delete ret.totalPrice;
    if (ret.shippingAddress) {
      ret.shippingAddress.zipCode = ret.shippingAddress.pincode;
      delete ret.shippingAddress.pincode;
    }
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);

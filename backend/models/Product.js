const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Product must belong to a seller'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Other'],
      message: '{VALUE} is not a valid category',
    },
  },
  brand: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [90, 'Discount cannot exceed 90%'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock count is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  images: {
    type: [
      {
        url: { type: String },
        public_id: { type: String },
      },
    ],
    validate: {
      validator: function (value) {
        return value.length > 0;
      },
      message: 'At least one product image is required',
    },
  },
  ratings: {
    type: Number,
    default: 0,
    min: [0, 'Ratings cannot be negative'],
    max: [5, 'Ratings cannot exceed 5'],
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

productSchema.virtual('finalPrice').get(function () {
  const discount = this.price * (this.discountPercent / 100);
  return Math.round((this.price - discount) * 100) / 100;
});

productSchema.pre('save', function () {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
});

productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ ratings: -1 });

module.exports = mongoose.model('Product', productSchema);

const { validate, notEmpty, isEmail, minLength, maxLength, isFloat, isInt, isIn, isArray, matches } = require('../utils/validate');

const validateRegister = validate([
  { field: 'name', checks: [notEmpty('Name is required'), minLength(2, 'Name must be at least 2 characters'), maxLength(50, 'Name cannot exceed 50 characters')] },
  { field: 'email', checks: [notEmpty('Email is required'), isEmail('Please provide a valid email address')] },
  { field: 'password', checks: [notEmpty('Password is required'), minLength(8, 'Password must be at least 8 characters'), matches(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Password must contain at least one letter and one number')] },
]);

const validateLogin = validate([
  { field: 'email', checks: [notEmpty('Email is required'), isEmail('Please provide a valid email address')] },
  { field: 'password', checks: [notEmpty('Password is required')] },
]);

const validateCreateProduct = validate([
  { field: 'name', checks: [notEmpty('Product name is required'), maxLength(200, 'Product name must be under 200 characters')] },
  { field: 'price', checks: [notEmpty('Price is required'), isFloat({ min: 0.01 }, 'Price must be greater than 0')] },
  { field: 'description', checks: [notEmpty('Description is required')] },
  { field: 'category', checks: [notEmpty('Category is required')] },
  { field: 'stock', checks: [notEmpty('Stock is required'), isInt({ min: 0 }, 'Stock must be a non-negative integer')] },
  { field: 'images', checks: [isArray({ min: 1 }, 'At least one image is required')] },
]);

const validateCreateOrder = validate([
  { field: 'shippingAddress', checks: [notEmpty('Shipping address is required')] },
  { field: 'shippingAddress.fullName', checks: [notEmpty('Full name is required')] },
  { field: 'shippingAddress.phone', checks: [notEmpty('Phone number is required')] },
  { field: 'shippingAddress.street', checks: [notEmpty('Street address is required')] },
  { field: 'shippingAddress.city', checks: [notEmpty('City is required')] },
  { field: 'shippingAddress.state', checks: [notEmpty('State is required')] },
  { field: 'shippingAddress.zipCode', checks: [notEmpty('Zip code is required')] },
  { field: 'paymentMethod', checks: [notEmpty('Payment method is required'), isIn(['cod', 'upi', 'card', 'netbanking', 'COD', 'UPI', 'CARD', 'NETBANKING'], 'Invalid payment method')] },
]);

const validateCreateReview = validate([
  { field: 'rating', checks: [notEmpty('Rating is required'), isInt({ min: 1, max: 5 }, 'Rating must be between 1 and 5')] },
  { field: 'comment', checks: [notEmpty('Review comment is required'), minLength(10, 'Review must be at least 10 characters'), maxLength(1000, 'Review cannot exceed 1000 characters')] },
]);

module.exports = { validateRegister, validateLogin, validateCreateProduct, validateCreateOrder, validateCreateReview };

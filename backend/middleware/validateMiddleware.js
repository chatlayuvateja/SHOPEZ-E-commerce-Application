const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(422).json({
      status: 'fail',
      errors: formattedErrors,
    });
  }
  next();
};

const validateCreateProduct = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name must be under 200 characters'),
  body('price')
    .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('description')
    .notEmpty().withMessage('Description is required'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('images')
    .isArray({ min: 1 }).withMessage('At least one image is required'),
  body('images.*')
    .isString().notEmpty().withMessage('Each image URL must be a non-empty string'),
  handleValidationErrors,
];

const validateCreateOrder = [
  body('shippingAddress')
    .notEmpty().withMessage('Shipping address is required'),
  body('shippingAddress.fullName')
    .notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.address')
    .notEmpty().withMessage('Address is required'),
  body('shippingAddress.city')
    .notEmpty().withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode')
    .notEmpty().withMessage('Pincode is required'),
  body('paymentMethod')
    .isIn(['COD', 'Card', 'UPI', 'Net Banking']).withMessage('Invalid payment method'),
  handleValidationErrors,
];

const validateCreateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Review must be between 10 and 1000 characters'),
  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin, handleValidationErrors, validateCreateProduct, validateCreateOrder, validateCreateReview };

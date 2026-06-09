const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductBySlug,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getProductsByCategory);
router.get('/:slug', getProductBySlug);
router.post('/', protect, restrictTo('SELLER', 'ADMIN'), createProduct);
router.put('/:id', protect, restrictTo('SELLER', 'ADMIN'), updateProduct);
router.delete('/:id', protect, restrictTo('SELLER', 'ADMIN'), deleteProduct);

module.exports = router;

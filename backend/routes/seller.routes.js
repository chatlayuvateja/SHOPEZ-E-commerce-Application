const express = require('express');
const router = express.Router();

const {
  getSellerStats,
  getSellerProducts,
  getSellerOrders,
  updateSellerOrderStatus,
} = require('../controllers/sellerController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect, restrictTo('SELLER', 'ADMIN'));

router.get('/stats', getSellerStats);
router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.patch('/orders/:id/status', updateSellerOrderStatus);

module.exports = router;

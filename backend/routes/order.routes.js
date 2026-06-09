const express = require('express');
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.patch('/:id/cancel', protect, cancelOrder);
router.patch('/:id/status', protect, restrictTo('SELLER', 'ADMIN'), updateOrderStatus);

module.exports = router;

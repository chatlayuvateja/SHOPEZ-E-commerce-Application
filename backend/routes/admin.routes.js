const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllOrders,
  getDashboardStats,
} = require('../controllers/adminController');

const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect, restrictTo('ADMIN'));

router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/orders', getAllOrders);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;

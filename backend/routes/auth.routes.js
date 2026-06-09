const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updatePassword,
} = require('../controllers/authController');

const { protect, refreshTokenHandler } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require('../middleware/validateMiddleware');

router.post('/register', validateRegister, handleValidationErrors, registerUser);
router.post('/login', validateLogin, handleValidationErrors, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.patch('/update-password', protect, updatePassword);
router.post('/refresh-token', refreshTokenHandler);

module.exports = router;

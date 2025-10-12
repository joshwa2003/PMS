const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  checkFirstLogin,
  setInitialPassword,
  selectDepartment,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  firstLoginPasswordReset
} = require('../controllers/authController');

const { protect, rateLimitLogin } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateForgotPassword,
  validateVerifyOTP,
  validateResetPassword,
  validateFirstLoginPasswordReset
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', rateLimitLogin, validateLogin, login);

// Forgot password routes (public)
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/verify-reset-otp', validateVerifyOTP, verifyResetOTP);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validateChangePassword, changePassword);
router.post('/logout', protect, logout);

// First login routes
router.get('/first-login-check', protect, checkFirstLogin);
router.put('/set-initial-password', protect, setInitialPassword);
router.put('/select-department', protect, selectDepartment);
router.post('/first-login-password-reset', protect, validateFirstLoginPasswordReset, firstLoginPasswordReset);

module.exports = router;

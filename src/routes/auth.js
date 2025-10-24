const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  changePassword, 
  forgotPassword, 
  resetPassword, 
  forceChangePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors 
} = require('../utils/validation');

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.get('/me', protect, getMe);
router.put('/changepassword', protect, validateChangePassword, handleValidationErrors, changePassword);
router.post('/forgotpassword', validateForgotPassword, handleValidationErrors, forgotPassword);
router.put('/resetpassword/:resettoken', validateResetPassword, handleValidationErrors, resetPassword);
router.put('/forcechangepassword', protect, validateResetPassword, handleValidationErrors, forceChangePassword);

module.exports = router;
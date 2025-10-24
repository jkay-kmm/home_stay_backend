const express = require('express');
const {
  getProfile,
  updateProfile,
  getUsers,
  getUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, validateProfileUpdate, handleValidationErrors, updateProfile);

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUser);

module.exports = router;
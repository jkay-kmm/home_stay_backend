const express = require('express');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  getPublicProfile,
  verifyContact,
  getDashboardStats
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { validateProfileUpdate, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

// Private routes
router.get('/', protect, getProfile);                                           // GET /api/profile - Private
router.put('/', protect, validateProfileUpdate, handleValidationErrors, updateProfile); // PUT /api/profile - Private
router.put('/avatar', protect, updateAvatar);                                   // PUT /api/profile/avatar - Private
router.put('/verify', protect, verifyContact);                                  // PUT /api/profile/verify - Private
router.get('/dashboard', protect, getDashboardStats);                           // GET /api/profile/dashboard - Private

// Public routes
router.get('/:id', getPublicProfile);                                          // GET /api/profile/:id - Public

module.exports = router;
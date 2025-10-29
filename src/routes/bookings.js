const express = require('express');
const {
  checkAvailability,
  createBooking,
  getUserBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { validateBooking, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

router.get('/check-availability', checkAvailability);        // GET /api/bookings/check-availability - Public
router.post('/create', protect, validateBooking, handleValidationErrors, createBooking);             // POST /api/bookings/create - Private
router.get('/user', protect, getUserBookings);              // GET /api/bookings/user - Private
router.post('/:id/cancel', protect, cancelBooking);         // POST /api/bookings/:id/cancel - Private

module.exports = router;
const express = require('express');
const {
  getHomestays,
  getHomestay,
  createHomestay,
  updateHomestay,
  deleteHomestay
} = require('../controllers/homestayController');
const { protect, authorize } = require('../middleware/auth');
const { validateHomestay, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

router.route('/')
  .get(getHomestays)                                    // GET /api/listings - Public
  .post(protect, authorize('host', 'admin'), validateHomestay, handleValidationErrors, createHomestay);  // POST /api/listings - Host only

router.route('/:id')
  .get(getHomestay)                                     // GET /api/listings/:id - Public
  .put(protect, authorize('host', 'admin'), validateHomestay, handleValidationErrors, updateHomestay)    // PUT /api/listings/:id - Host only
  .delete(protect, authorize('host', 'admin'), deleteHomestay); // DELETE /api/listings/:id - Host only

module.exports = router;
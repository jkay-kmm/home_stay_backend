const express = require('express');
const {
  getHomestayReviews,
  createReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReview, handleValidationErrors } = require('../utils/validation');

const router = express.Router();

router.get('/listing/:id', getHomestayReviews);             // GET /api/reviews/listing/:id - Public
router.post('/create', protect, validateReview, handleValidationErrors, createReview);             // POST /api/reviews/create - Private

module.exports = router;
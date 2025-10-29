const Review = require('../models/Review');
const Homestay = require('../models/Homestay');
const Booking = require('../models/Booking');

// @desc    Get reviews for a homestay
// @route   GET /api/reviews/listing/:id
// @access  Public
const getHomestayReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const homestayId = req.params.id;

    // Check if homestay exists
    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get reviews
    const reviews = await Review.find({ homestay: homestayId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Review.countDocuments({ homestay: homestayId });
    const totalPages = Math.ceil(total / limitNum);

    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { homestay: homestay._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      homestay: {
        id: homestay._id,
        title: homestay.title,
        averageRating: homestay.averageRating,
        totalReviews: homestay.totalReviews
      },
      ratingStats,
      data: reviews
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Create new review
// @route   POST /api/reviews/create
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { listing_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!listing_id || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide listing_id, rating, and comment'
      });
    }

    // Check if homestay exists
    const homestay = await Homestay.findById(listing_id);
    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }

    // Check if user has completed booking for this homestay
    const completedBooking = await Booking.findOne({
      user: user_id,
      homestay: listing_id,
      status: 'completed'
    });

    if (!completedBooking) {
      return res.status(400).json({
        success: false,
        message: 'You can only review homestays you have stayed at'
      });
    }

    // Check if user already reviewed this homestay
    const existingReview = await Review.findOne({
      user: user_id,
      homestay: listing_id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this homestay'
      });
    }

    // Create review
    const review = await Review.create({
      homestay: listing_id,
      user: user_id,
      rating,
      comment
    });

    // Populate review details
    await review.populate('user', 'name');
    await review.populate('homestay', 'title');

    res.status(201).json({
      success: true,
      data: review
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomestayReviews,
  createReview
};
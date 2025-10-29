const Booking = require('../models/Booking');
const Homestay = require('../models/Homestay');

// @desc    Check availability
// @route   GET /api/bookings/check-availability
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { listing_id, check_in, check_out } = req.query;

    // Validate required fields
    if (!listing_id || !check_in || !check_out) {
      return res.status(400).json({
        success: false,
        message: 'Please provide listing_id, check_in, and check_out dates'
      });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Check if homestay exists
    const homestay = await Homestay.findById(listing_id);
    if (!homestay || !homestay.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found or not available'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      homestay: listing_id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    const isAvailable = conflictingBookings.length === 0;

    res.status(200).json({
      success: true,
      available: isAvailable,
      homestay: {
        id: homestay._id,
        title: homestay.title,
        price: homestay.price,
        maxGuests: homestay.maxGuests
      },
      requestedDates: {
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights: Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      },
      conflictingBookings: isAvailable ? [] : conflictingBookings.map(booking => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status
      }))
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { listing_id, check_in, check_out, guests, total_price, payment_method } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!listing_id || !check_in || !check_out || !guests || !total_price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Validate dates
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Check if homestay exists and is available
    const homestay = await Homestay.findById(listing_id);
    if (!homestay || !homestay.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found or not available'
      });
    }

    // Check guest capacity
    if (guests > homestay.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `Maximum guests allowed: ${homestay.maxGuests}`
      });
    }

    // Check availability
    const conflictingBookings = await Booking.find({
      homestay: listing_id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Homestay is not available for the selected dates'
      });
    }

    // Create booking
    const booking = await Booking.create({
      homestay: listing_id,
      user: user_id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice: total_price,
      paymentMethod: payment_method || 'Credit Card'
    });

    // Populate booking details
    await booking.populate('homestay', 'title location price');
    await booking.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/user
// @access  Private
const getUserBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const user_id = req.user.id;

    // Build query
    let query = { user: user_id };
    if (status) {
      query.status = status.toLowerCase();
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get bookings
    const bookings = await Booking.find(query)
      .populate('homestay', 'title location price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      data: bookings
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { cancel_reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Check cancellation policy (24 hours before check-in)
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking less than 24 hours before check-in'
      });
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = cancel_reason || 'Cancelled by user';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkAvailability,
  createBooking,
  getUserBookings,
  cancelBooking
};
const Homestay = require('../models/Homestay');
const Booking = require('../models/Booking');

// @desc    Get all homestays with search and pagination
// @route   GET /api/listings
// @access  Public
const getHomestays = async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      location,
      check_in,
      check_out,
      guests,
      min_price,
      max_price,
      amenities,
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    let query = { isActive: true };

    // Location search (case-insensitive)
    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { title: { $regex: location, $options: 'i' } },
        { address: { $regex: location, $options: 'i' } }
      ];
    }

    // Price range filter
    if (min_price || max_price) {
      query.price = {};
      if (min_price) query.price.$gte = parseFloat(min_price);
      if (max_price) query.price.$lte = parseFloat(max_price);
    }

    // Guest capacity filter
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $in: amenitiesArray };
    }

    // Get homestays that are NOT booked for the specified dates
    let homestayIds = [];
    if (check_in && check_out) {
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

      // Find homestays that are already booked for these dates
      const bookedHomestays = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          {
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          }
        ]
      }).distinct('homestay');

      // Exclude booked homestays
      if (bookedHomestays.length > 0) {
        query._id = { $nin: bookedHomestays };
      }
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const homestays = await Homestay.find(query)
      .populate('host', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const total = await Homestay.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: homestays.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      data: homestays
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get single homestay by ID
// @route   GET /api/listings/:id
// @access  Public
const getHomestay = async (req, res, next) => {
  try {
    const homestay = await Homestay.findById(req.params.id)
      .populate('host', 'name email createdAt');

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }

    if (!homestay.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Homestay is not available'
      });
    }

    res.status(200).json({
      success: true,
      data: homestay
    });

  } catch (err) {
    // Handle invalid ObjectId
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }
    next(err);
  }
};

// @desc    Create new homestay
// @route   POST /api/listings
// @access  Private (Host only)
const createHomestay = async (req, res, next) => {
  try {
    // Add host to req.body
    req.body.host = req.user.id;

    const homestay = await Homestay.create(req.body);

    res.status(201).json({
      success: true,
      data: homestay
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update homestay
// @route   PUT /api/listings/:id
// @access  Private (Host only)
const updateHomestay = async (req, res, next) => {
  try {
    let homestay = await Homestay.findById(req.params.id);

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }

    // Make sure user is homestay host
    if (homestay.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this homestay'
      });
    }

    homestay = await Homestay.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: homestay
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Delete homestay
// @route   DELETE /api/listings/:id
// @access  Private (Host only)
const deleteHomestay = async (req, res, next) => {
  try {
    const homestay = await Homestay.findById(req.params.id);

    if (!homestay) {
      return res.status(404).json({
        success: false,
        message: 'Homestay not found'
      });
    }

    // Make sure user is homestay host
    if (homestay.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this homestay'
      });
    }

    // Soft delete by setting isActive to false
    await Homestay.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Homestay deleted successfully'
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomestays,
  getHomestay,
  createHomestay,
  updateHomestay,
  deleteHomestay
};
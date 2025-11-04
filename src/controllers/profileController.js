const User = require('../models/User');
const Homestay = require('../models/Homestay');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional stats if user is a host
    let hostStats = {};
    if (user.role === 'host') {
      const totalListings = await Homestay.countDocuments({ host: user._id, isActive: true });
      const totalBookings = await Booking.countDocuments({ homestay: { $in: await Homestay.find({ host: user._id }).distinct('_id') } });
      
      // Calculate host rating from homestay reviews
      const hostHomestays = await Homestay.find({ host: user._id }).select('_id');
      const homestayIds = hostHomestays.map(h => h._id);
      
      const avgRating = await Review.aggregate([
        { $match: { homestay: { $in: homestayIds } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      hostStats = {
        totalListings,
        totalBookings,
        hostRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
      };

      // Update host info in user document
      user.hostInfo.totalListings = totalListings;
      user.hostInfo.totalBookings = totalBookings;
      user.hostInfo.hostRating = hostStats.hostRating;
      await user.save({ validateBeforeSave: false });
    }

    // Get user booking stats
    const bookingStats = await Booking.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          hostStats: user.role === 'host' ? hostStats : null,
          bookingStats
        }
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      avatar,
      dateOfBirth,
      gender,
      address,
      bio,
      languages,
      preferences,
      hostInfo
    } = req.body;

    const fieldsToUpdate = {};

    // Basic info
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (avatar) fieldsToUpdate.avatar = avatar;
    if (dateOfBirth) fieldsToUpdate.dateOfBirth = dateOfBirth;
    if (gender) fieldsToUpdate.gender = gender;
    if (bio) fieldsToUpdate.bio = bio;
    if (languages) fieldsToUpdate.languages = languages;

    // Address
    if (address) {
      fieldsToUpdate.address = {
        ...req.user.address,
        ...address
      };
    }

    // Preferences
    if (preferences) {
      fieldsToUpdate.preferences = {
        ...req.user.preferences,
        ...preferences
      };
    }

    // Host info (only for hosts)
    if (hostInfo && req.user.role === 'host') {
      fieldsToUpdate.hostInfo = {
        ...req.user.hostInfo,
        ...hostInfo
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update profile avatar
// @route   PUT /api/profile/avatar
// @access  Private
const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: 'Please provide avatar URL'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get public profile
// @route   GET /api/profile/:id
// @access  Public
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio languages verified hostInfo role createdAt')
      .populate({
        path: 'hostInfo',
        select: 'joinedDate totalListings hostRating responseRate responseTime'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get host's homestays if user is a host
    let hostListings = [];
    if (user.role === 'host') {
      hostListings = await Homestay.find({ host: user._id, isActive: true })
        .select('title location price averageRating totalReviews images')
        .limit(6);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        hostListings
      }
    });

  } catch (err) {
    // Handle invalid ObjectId
    if (err.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    next(err);
  }
};

// @desc    Verify email/phone
// @route   PUT /api/profile/verify
// @access  Private
const verifyContact = async (req, res, next) => {
  try {
    const { type, verified } = req.body; // type: 'email' or 'phone'

    if (!['email', 'phone'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification type'
      });
    }

    const updateField = `verified.${type}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { [updateField]: verified === true },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: `${type} verification updated`,
      data: user
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/profile/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'host') {
      // Host dashboard stats
      const totalListings = await Homestay.countDocuments({ host: userId, isActive: true });
      const totalBookings = await Booking.countDocuments({
        homestay: { $in: await Homestay.find({ host: userId }).distinct('_id') }
      });

      const monthlyBookings = await Booking.aggregate([
        {
          $match: {
            homestay: { $in: await Homestay.find({ host: userId }).distinct('_id') },
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      const recentBookings = await Booking.find({
        homestay: { $in: await Homestay.find({ host: userId }).distinct('_id') }
      })
        .populate('user', 'name avatar')
        .populate('homestay', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalListings,
        totalBookings,
        monthlyBookings,
        recentBookings
      };

    } else {
      // User dashboard stats
      const totalBookings = await Booking.countDocuments({ user: userId });
      const upcomingBookings = await Booking.find({
        user: userId,
        status: 'confirmed',
        checkIn: { $gte: new Date() }
      })
        .populate('homestay', 'title location images')
        .sort({ checkIn: 1 })
        .limit(3);

      const recentBookings = await Booking.find({ user: userId })
        .populate('homestay', 'title location images')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalBookings,
        upcomingBookings,
        recentBookings
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateAvatar,
  getPublicProfile,
  verifyContact,
  getDashboardStats
};
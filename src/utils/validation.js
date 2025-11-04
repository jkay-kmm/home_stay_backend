const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: 255 })
    .withMessage('Email is too long'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Phone must be 10-11 digits'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),
  
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('address.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('preferences.currency')
    .optional()
    .isIn(['VND', 'USD', 'EUR'])
    .withMessage('Currency must be VND, USD, or EUR'),
  
  body('preferences.language')
    .optional()
    .isIn(['vi', 'en'])
    .withMessage('Language must be vi or en'),
];

// Validation rules for password change
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// Validation rules for forgot password
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

// Validation rules for reset password
const validateResetPassword = [
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// Validation rules for homestay creation
const validateHomestay = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),
  
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('maxGuests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Max guests must be between 1 and 20'),
  
  body('bedrooms')
    .isInt({ min: 1, max: 10 })
    .withMessage('Bedrooms must be between 1 and 10'),
  
  body('bathrooms')
    .isInt({ min: 1, max: 10 })
    .withMessage('Bathrooms must be between 1 and 10'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
];

// Validation rules for booking creation
const validateBooking = [
  body('listing_id')
    .isMongoId()
    .withMessage('Invalid homestay ID'),
  
  body('check_in')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  
  body('check_out')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  
  body('guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Guests must be between 1 and 20'),
  
  body('total_price')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  
  body('payment_method')
    .optional()
    .isIn(['Credit Card', 'Bank Transfer', 'Cash', 'E-Wallet'])
    .withMessage('Invalid payment method'),
];

// Validation rules for review creation
const validateReview = [
  body('listing_id')
    .isMongoId()
    .withMessage('Invalid homestay ID'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Comment must be between 5 and 500 characters'),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateHomestay,
  validateBooking,
  validateReview,
  handleValidationErrors
};
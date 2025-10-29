const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  homestay: {
    type: mongoose.Schema.ObjectId,
    ref: 'Homestay',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Please add check-in date']
  },
  checkOut: {
    type: Date,
    required: [true, 'Please add check-out date']
  },
  guests: {
    type: Number,
    required: [true, 'Please add number of guests'],
    min: [1, 'Must have at least 1 guest']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please add total price'],
    min: [0, 'Total price must be positive']
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Bank Transfer', 'Cash', 'E-Wallet'],
    default: 'Credit Card'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String
  }
});

// Index for availability checks and user bookings
BookingSchema.index({ homestay: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ status: 1 });

// Validation: Check-out must be after check-in
BookingSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
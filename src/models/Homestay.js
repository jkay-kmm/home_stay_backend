const mongoose = require('mongoose');

const HomestaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  coordinates: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  price: {
    type: Number,
    required: [true, 'Please add a price per night'],
    min: [0, 'Price must be positive']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Please add maximum number of guests'],
    min: [1, 'Must accommodate at least 1 guest']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please add number of bedrooms'],
    min: [1, 'Must have at least 1 bedroom']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please add number of bathrooms'],
    min: [1, 'Must have at least 1 bathroom']
  },
  amenities: [{
    type: String,
    enum: [
      'Wifi',
      'Bể bơi',
      'Bãi đậu xe',
      'Điều hòa',
      'Tivi',
      'Bếp',
      'Máy giặt',
      'Sân vườn',
      'Ban công',
      'Thang máy',
      'Phòng gym',
      'BBQ',
      'Lò sưởi',
      'Jacuzzi',
      'Sauna'
    ]
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Homestay image'
    }
  }],
  host: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must can not be more than 5'],
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search optimization
HomestaySchema.index({ location: 'text', title: 'text', description: 'text' });
HomestaySchema.index({ location: 1, price: 1 });
HomestaySchema.index({ isActive: 1 });

// Update the updatedAt field before saving
HomestaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Homestay', HomestaySchema);
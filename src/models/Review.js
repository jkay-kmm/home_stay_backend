const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ReviewSchema.index({ homestay: 1, createdAt: -1 });
ReviewSchema.index({ user: 1 });

// Prevent user from submitting more than one review per homestay
ReviewSchema.index({ homestay: 1, user: 1 }, { unique: true });

// Static method to get average rating and save to homestay
ReviewSchema.statics.getAverageRating = async function(homestayId) {
  const obj = await this.aggregate([
    {
      $match: { homestay: homestayId }
    },
    {
      $group: {
        _id: '$homestay',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.model('Homestay').findByIdAndUpdate(homestayId, {
        averageRating: Math.round(obj[0].averageRating * 10) / 10,
        totalReviews: obj[0].totalReviews
      });
    } else {
      await this.model('Homestay').findByIdAndUpdate(homestayId, {
        averageRating: 0,
        totalReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.homestay);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.homestay);
});

module.exports = mongoose.model('Review', ReviewSchema);
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);

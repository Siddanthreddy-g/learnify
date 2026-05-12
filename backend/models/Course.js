const mongoose = require('mongoose');

// Preservation of your original Lesson structure, now as a "video" type
const contentItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Distinguishes between a video lecture and a quiz
  type: { type: String, enum: ['video', 'quiz'], required: true }, 
  
  // Fields for Video type (Your original lesson fields)
  description: { type: String },
  videoUrl: { type: String },
  duration: { type: Number, default: 0 },
  resources: [{ name: String, url: String }],
  isFree: { type: Boolean, default: false },

  // Fields for Quiz type (Linked to your LearningModels.js logic)
  quizData: {
    questions: [{
      questionText: String,
      options: [String],
      correctAnswer: Number // Index of the correct option
    }]
  },
  
  order: { type: Number, required: true }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
  // Changed from 'lessons' to 'content' to allow interleaved Quizzes
  content: [contentItemSchema] 
});

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  thumbnail: { type: String, default: '' },
  category: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  language: { type: String, default: 'English' },
  price: { type: Number, default: 0 },
  tags: [String],
  modules: [moduleSchema], // Uses the updated moduleSchema with interleaved content
  reviews: [reviewSchema],
  totalStudents: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  whatYouLearn: [String],
  requirements: [String],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// Existing logic preserved
courseSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) { this.averageRating = 0; return; }
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
};

module.exports = mongoose.model('Course', courseSchema);
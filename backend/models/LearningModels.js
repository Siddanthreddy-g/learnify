const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  isCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0 }
}, { timestamps: true });

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, required: true },
  module: { type: mongoose.Schema.Types.ObjectId, required: true },
  isCompleted: { type: Boolean, default: false },
  watchedSeconds: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now },
  certificateId: { type: String, unique: true, required: true },
  pdfUrl: { type: String }
}, { timestamps: true });

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, required: true },
  afterLesson: { type: mongoose.Schema.Types.ObjectId },
  title: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String
  }],
  passingScore: { type: Number, default: 70 },
  timeLimit: { type: Number, default: 600 }
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [Number],
  score: Number,
  passed: Boolean,
  attemptedAt: { type: Date, default: Date.now }
});

module.exports.Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports.Progress = mongoose.model('Progress', progressSchema);
module.exports.Certificate = mongoose.model('Certificate', certificateSchema);
module.exports.Quiz = mongoose.model('Quiz', quizSchema);
module.exports.QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

const express = require('express');
const router = express.Router();
const { Quiz, QuizAttempt } = require('../models/LearningModels');
const { protect, isInstructor } = require('../middleware/auth');
const User = require('../models/User');

// Create quiz (instructor)
router.post('/', protect, isInstructor, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all quizzes for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId });
    res.json(quizzes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get quiz for a specific lesson
router.get('/lesson/:lessonId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ afterLesson: req.params.lessonId });
    res.json(quiz || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Submit quiz attempt
router.post('/:quizId/attempt', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return { question: q.question, selected: answers[i], correctIndex: q.correctIndex, isCorrect, explanation: q.explanation };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: req.params.quizId,
      answers,
      score,
      passed,
    });

    // Award XP for passing
    if (passed) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 20 } });
    }

    res.json({ attempt, score, passed, correct, total: quiz.questions.length, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my attempts for a quiz
router.get('/:quizId/my-attempts', protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user._id, quiz: req.params.quizId }).sort({ attemptedAt: -1 });
    res.json(attempts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

// enrollments.js
const express = require('express');
const router = express.Router();
const { Enrollment } = require('../models/LearningModels');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.post('/:courseId', protect, async (req, res) => {
  try {
    const existing = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    const enrollment = await Enrollment.create({ student: req.user._id, course: req.params.courseId });
    await Course.findByIdAndUpdate(req.params.courseId, { $inc: { totalStudents: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: req.params.courseId } });
    res.status(201).json(enrollment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title thumbnail instructor averageRating totalStudents level');
    res.json(enrollments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/check/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    res.json({ enrolled: !!enrollment, enrollment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

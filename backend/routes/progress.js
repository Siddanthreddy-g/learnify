const express = require('express');
const router = express.Router();
const { Progress, Enrollment } = require('../models/LearningModels');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Mark a lesson complete
router.post('/lesson', protect, async (req, res) => {
  try {
    const { courseId, moduleId, lessonId, watchedSeconds } = req.body;

    let progress = await Progress.findOne({
      student: req.user._id,
      course: courseId,
      lesson: lessonId,
    });

    if (!progress) {
      progress = new Progress({
        student: req.user._id,
        course: courseId,
        module: moduleId,
        lesson: lessonId,
      });
    }

    const wasAlreadyDone = progress.isCompleted;
    progress.watchedSeconds = Math.max(progress.watchedSeconds || 0, watchedSeconds || 0);

    if (!wasAlreadyDone) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
      // Award XP only first time
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10 } });
    } else {
      await progress.save();
    }

    // Recalculate completion %
    const course = await Course.findById(courseId);
    const totalLessons = course.modules.reduce((a, m) => a + (m.content ? m.content.length : 0), 0);
    const completedCount = await Progress.countDocuments({
      student: req.user._id,
      course: courseId,
      isCompleted: true,
    });

    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const isNowComplete = percentage === 100;

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: courseId },
      {
        completionPercentage: percentage,
        isCompleted: isNowComplete,
        ...(isNowComplete ? { completedAt: new Date() } : {}),
      },
      { new: true }
    );

    res.json({
      progress,
      completionPercentage: percentage,
      isCompleted: isNowComplete,
      enrollment,
      xpAwarded: wasAlreadyDone ? 0 : 10,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all progress for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const progressList = await Progress.find({
      student: req.user._id,
      course: req.params.courseId,
    });
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });
    res.json({
      progress: progressList,
      completionPercentage: enrollment?.completionPercentage || 0,
      isCompleted: enrollment?.isCompleted || false,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

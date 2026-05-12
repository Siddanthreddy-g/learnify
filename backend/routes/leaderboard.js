const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Enrollment } = require('../models/LearningModels');

router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name xp streak enrolledCourses')
      .sort({ xp: -1 })
      .limit(20);

    // Count completed courses per user
    const leaderboard = await Promise.all(users.map(async (u) => {
      const completedCourses = await Enrollment.countDocuments({ student: u._id, isCompleted: true });
      return {
        name: u.name,
        xp: u.xp || 0,
        streak: u.streak || 0,
        completedCourses,
      };
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

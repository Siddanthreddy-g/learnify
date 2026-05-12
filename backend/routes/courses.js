const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const { protect, isInstructor } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.mimetype.startsWith('video') ? 'uploads/videos' : 'uploads/thumbnails';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .select('-modules')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    res.json({ courses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio createdCourses')
      .populate('reviews.user', 'name avatar');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, isInstructor, async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, instructor: req.user._id });
    await require('../models/User').findByIdAndUpdate(req.user._id, { $push: { createdCourses: course._id } });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, isInstructor, async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });
    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/thumbnail', protect, isInstructor, upload.single('thumbnail'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { thumbnail: req.file.path }, { new: true });
    res.json({ thumbnail: course.thumbnail });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/modules/:moduleId/lessons/:lessonId/video', protect, isInstructor, upload.single('video'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const module = course.modules.id(req.params.moduleId);
    const lesson = module.lessons.id(req.params.lessonId);
    lesson.videoUrl = req.file.path;
    await course.save();
    res.json({ videoUrl: lesson.videoUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    const existing = course.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (existing) return res.status(400).json({ message: 'Already reviewed' });
    course.reviews.push({ user: req.user._id, rating, comment });
    course.calculateRating();
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/instructor/my-courses', protect, isInstructor, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

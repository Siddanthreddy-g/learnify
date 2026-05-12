const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { Certificate, Enrollment } = require('../models/LearningModels');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate certificate after course completion
router.post('/generate/:courseId', protect, async (req, res) => {
  try {
    // Check course is completed
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
      isCompleted: true,
    });

    if (!enrollment) {
      return res.status(400).json({ message: 'Course not completed yet. Complete all lessons first.' });
    }

    // Return existing certificate if already generated
    const existing = await Certificate.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });
    if (existing) return res.json(existing);

    const course = await Course.findById(req.params.courseId).populate('instructor', 'name');
    const student = await User.findById(req.user._id);
    const certId = uuidv4().substring(0, 12).toUpperCase();

    // Create directory
    const dir = path.join(__dirname, '..', 'uploads', 'certificates');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `cert-${certId}.pdf`;
    const filepath = path.join(dir, filename);

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const W = 842, H = 595;

    // Background
    doc.rect(0, 0, W, H).fill('#0f0f11');

    // Outer border
    doc.rect(24, 24, W - 48, H - 48)
      .lineWidth(1.5)
      .stroke('#2d2d35');

    // Inner border
    doc.rect(32, 32, W - 64, H - 64)
      .lineWidth(0.5)
      .stroke('#1e1e26');

    // Top accent line
    doc.rect(32, 32, W - 64, 3)
      .fill('#8b5cf6');

    // Decorative left bar
    doc.rect(32, 35, 3, H - 70)
      .fill('#8b5cf6');

    // Certificate label
    doc.fillColor('#8b5cf6')
      .fontSize(10)
      .font('Helvetica')
      .text('CERTIFICATE OF COMPLETION', 0, 68, { align: 'center', characterSpacing: 3 });

    // Decorative line under label
    doc.moveTo(W / 2 - 80, 85).lineTo(W / 2 + 80, 85)
      .lineWidth(0.5).stroke('#2d2d35');

    // Main heading
    doc.fillColor('#ffffff')
      .fontSize(36)
      .font('Helvetica-Bold')
      .text('This certifies that', 0, 104, { align: 'center' });

    // Student name
    doc.fillColor('#a78bfa')
      .fontSize(52)
      .font('Helvetica-Bold')
      .text(student.name, 60, 150, { align: 'center', width: W - 120 });

    // Underline name
    const nameWidth = Math.min(student.name.length * 22, W - 120);
    const nameX = (W - nameWidth) / 2;
    doc.moveTo(nameX, 215).lineTo(nameX + nameWidth, 215)
      .lineWidth(0.5).stroke('#3d3d50');

    // Body text
    doc.fillColor('#a1a1aa')
      .fontSize(14)
      .font('Helvetica')
      .text('has successfully completed the course', 0, 228, { align: 'center' });

    // Course title
    doc.fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(course.title, 80, 252, { align: 'center', width: W - 160 });

    // Divider
    doc.moveTo(W / 2 - 120, 310).lineTo(W / 2 + 120, 310)
      .lineWidth(0.5).stroke('#2d2d35');

    // Details row
    const detailsY = 326;
    const cols = [
      { label: 'Instructor', value: course.instructor?.name || 'Learnify' },
      { label: 'Issued on', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
      { label: 'Certificate ID', value: certId },
    ];

    cols.forEach((col, i) => {
      const x = 140 + i * 190;
      doc.fillColor('#52525b').fontSize(9).font('Helvetica')
        .text(col.label.toUpperCase(), x, detailsY, { width: 160, align: 'center', characterSpacing: 1 });
      doc.fillColor('#d4d4d8').fontSize(12).font('Helvetica-Bold')
        .text(col.value, x, detailsY + 16, { width: 160, align: 'center' });
    });

    // Bottom divider
    doc.moveTo(60, 405).lineTo(W - 60, 405)
      .lineWidth(0.5).stroke('#1e1e26');

    // Signature area
    doc.fillColor('#52525b').fontSize(10).font('Helvetica')
      .text('Authorized by', 120, 420, { width: 160, align: 'center' });
    doc.fillColor('#a1a1aa').fontSize(13).font('Helvetica-Bold')
      .text('Learnify Platform', 120, 436, { width: 160, align: 'center' });

    // Verification note
    doc.fillColor('#3f3f46').fontSize(9).font('Helvetica')
      .text(`Verify at learnify.io/verify/${certId}`, 0, 420, { align: 'right', width: W - 60 });

    // Logo watermark bottom center
    doc.fillColor('#1e1e26').fontSize(11).font('Helvetica-Bold')
      .text('LEARNIFY', 0, H - 52, { align: 'center', characterSpacing: 4 });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Save certificate record
    const certificate = await Certificate.create({
      student: req.user._id,
      course: req.params.courseId,
      certificateId: certId,
      pdfUrl: filepath,
    });

    // Award XP and update user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { certificates: certificate._id },
      $inc: { xp: 100 },
    });

    res.json(certificate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get my certificates
router.get('/my', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title instructor level category')
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
    res.json(certificates);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Download certificate PDF
router.get('/download/:certId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    if (!fs.existsSync(cert.pdfUrl)) return res.status(404).json({ message: 'PDF file not found' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="learnify-certificate-${req.params.certId}.pdf"`);
    fs.createReadStream(cert.pdfUrl).pipe(res);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Verify certificate (public)
router.get('/verify/:certId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('student', 'name')
      .populate('course', 'title instructor')
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });
    res.json({
      valid: true,
      studentName: cert.student.name,
      courseTitle: cert.course.title,
      instructorName: cert.course.instructor?.name,
      issuedAt: cert.issuedAt,
      certificateId: cert.certificateId,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

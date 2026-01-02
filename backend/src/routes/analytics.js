const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const analyticsController = require('../controllers/analyticsController');

// Teacher analytics routes
router.get('/teacher/stats', auth, requireRole('teacher'), analyticsController.getTeacherStats);
router.get('/teacher/class/:classId', auth, requireRole('teacher'), analyticsController.getClassStats);
router.get('/teacher/trends', auth, requireRole('teacher'), analyticsController.getTeacherTrends);

// Student analytics routes
router.get('/student/stats', auth, requireRole('student'), analyticsController.getStudentStats);

module.exports = router;


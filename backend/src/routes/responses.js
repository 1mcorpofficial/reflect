const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const responseController = require('../controllers/responseController');

// List responses (for teacher review or student's own responses)
router.get('/', auth, responseController.listResponses);

// Get response details
router.get('/:id', auth, responseController.getResponse);

// Submit response (for students)
router.post('/schedule/:scheduleId', auth, requireRole('student'), responseController.submitResponse);

// Add teacher comment
router.post('/:id/comment', auth, requireRole('teacher'), responseController.addComment);

module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const aiController = require('../controllers/aiController');

// Process AI annotations for a specific response
router.post('/response/:responseId/process', auth, requireRole('teacher'), aiController.processResponse);

// Batch process responses for a schedule
router.post('/schedule/:scheduleId/process', auth, requireRole('teacher'), aiController.processSchedule);

// Get AI annotations for a response
router.get('/response/:responseId/annotations', auth, aiController.getAnnotations);

module.exports = router;


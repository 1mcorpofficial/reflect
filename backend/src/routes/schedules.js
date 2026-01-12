const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const scheduleController = require('../controllers/scheduleController');

router.post('/', auth, requireRole('teacher'), scheduleController.createSchedule);
router.get('/', auth, scheduleController.listSchedules);
router.get('/:id', auth, scheduleController.getSchedule);
router.patch('/:id', auth, requireRole('teacher'), scheduleController.updateSchedule);
router.delete('/:id', auth, requireRole('teacher'), scheduleController.deleteSchedule);
router.get('/:id/progress', auth, requireRole('teacher'), scheduleController.getProgress);

module.exports = router;


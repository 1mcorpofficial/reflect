const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const exportController = require('../controllers/exportController');

router.get('/schedule/:scheduleId/csv', auth, requireRole('teacher'), exportController.exportCSV);
router.get('/schedule/:scheduleId/pdf', auth, requireRole('teacher'), exportController.exportPDF);

module.exports = router;


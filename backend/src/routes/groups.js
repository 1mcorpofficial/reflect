const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/auth');

// POST /api/groups - create group (teacher only)
router.post('/', authMiddleware, groupController.createGroup);

// GET /api/groups - get my groups
router.get('/', authMiddleware, groupController.getMyGroups);

// POST /api/groups/join - join group with code
router.post('/join', authMiddleware, groupController.joinGroup);

// GET /api/groups/:id - group details
router.get('/:id', authMiddleware, groupController.getGroupDetails);

module.exports = router;

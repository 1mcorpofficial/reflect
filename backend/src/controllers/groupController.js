const Group = require('../models/Group');
const { logAction } = require('../services/auditService');

const generateUniqueCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await Group.findOne({ code });
    exists = !!existing;
  }
  return code;
};

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const teacherId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const code = await generateUniqueCode();

    const group = await Group.create({
      name,
      code,
      teacherId,
      studentIds: [],
    });

    // Log audit
    await logAction(req.user.id, 'create', 'Group', group._id, {
      name: group.name,
      code: group.code,
    }, req);

    res.status(201).json({
      id: group._id.toString(),
      name: group.name,
      code: group.code,
      teacherId: group.teacherId.toString(),
      studentIds: group.studentIds.map(id => id.toString()),
      createdAt: group.createdAt,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let groups;
    if (userRole === 'teacher') {
      groups = await Group.find({ teacherId: userId });
    } else {
      groups = await Group.find({ studentIds: userId });
    }

    res.json(
      groups.map(group => ({
        id: group._id.toString(),
        name: group.name,
        code: group.code,
        teacherId: group.teacherId.toString(),
        studentIds: group.studentIds.map(id => id.toString()),
        createdAt: group.createdAt,
      }))
    );
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user.id;

    const group = await Group.findOne({ code: code.toUpperCase().trim() });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.studentIds.includes(studentId)) {
      return res.status(400).json({ error: 'Already in group' });
    }

    group.studentIds.push(studentId);
    await group.save();

    res.json({
      message: 'Joined group',
      group: {
        id: group._id.toString(),
        name: group.name,
        code: group.code,
        teacherId: group.teacherId.toString(),
        studentIds: group.studentIds.map(id => id.toString()),
      },
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('teacherId', 'name email').populate('studentIds', 'name email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({
      id: group._id.toString(),
      name: group.name,
      code: group.code,
      teacherId: group.teacherId._id.toString(),
      teacherName: group.teacherId.name,
      studentIds: group.studentIds.map(s => s._id.toString()),
      students: group.studentIds.map(s => ({ id: s._id.toString(), name: s.name, email: s.email })),
      createdAt: group.createdAt,
    });
  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { createGroup, getMyGroups, joinGroup, getGroupDetails };

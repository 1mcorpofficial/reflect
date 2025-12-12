// Mock data (replace with database later)
const groups = [];

const createGroup = (req, res) => {
  const { name } = req.body;
  const teacherId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const newGroup = {
    id: Date.now().toString(),
    name,
    code,
    teacherId,
    studentIds: [],
    createdAt: new Date()
  };

  groups.push(newGroup);
  res.status(201).json(newGroup);
};

const getMyGroups = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let userGroups = [];
  if (userRole === 'teacher') {
    userGroups = groups.filter(g => g.teacherId === userId);
  } else {
    userGroups = groups.filter(g => g.studentIds.includes(userId));
  }

  res.json(userGroups);
};

const joinGroup = (req, res) => {
  const { code } = req.body;
  const studentId = req.user.id;

  const group = groups.find(g => g.code === code);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (group.studentIds.includes(studentId)) {
    return res.status(400).json({ error: 'Already in group' });
  }

  group.studentIds.push(studentId);
  res.json({ message: 'Joined group', group });
};

const getGroupDetails = (req, res) => {
  const { id } = req.params;
  const group = groups.find(g => g.id === id);

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  res.json(group);
};

module.exports = { createGroup, getMyGroups, joinGroup, getGroupDetails };

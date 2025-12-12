const jwt = require('jsonwebtoken');

// Mock data (replace with database later)
const users = [];

const register = (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    password, // TODO: Hash password with bcryptjs
    name,
    role,
    createdAt: new Date()
  };

  users.push(newUser);
  res.status(201).json({ message: 'User registered', user: { id: newUser.id, email, name, role } });
};

const login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email, name: user.name, role: user.role } });
};

const getMe = (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
};

module.exports = { register, login, getMe };

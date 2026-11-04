const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

// Register a new student/user
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role = 'student', phone, student_id, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = db.users.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = db.users.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: ['student', 'staff', 'admin'].includes(role) ? role : 'student',
      phone: phone || '',
      student_id: student_id || '',
      department: department || ''
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = newUser;
    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: userData
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;
    return res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

// Get current logged in user profile
router.get('/me', requireAuth, (req, res) => {
  const { password: _, ...userData } = req.user;
  return res.json({ user: userData });
});

// Demo accounts endpoint for easy one-click testing during presentation
router.get('/demo-accounts', (req, res) => {
  return res.json([
    {
      role: 'student',
      title: 'Student / Customer',
      email: 'student@college.edu',
      password: 'password123',
      description: 'Pre-order meals, track token & live queue status'
    },
    {
      role: 'staff',
      title: 'Kitchen & Counter Staff',
      email: 'staff@college.edu',
      password: 'password123',
      description: 'Kitchen Display System (KDS), manage preparation & pickup'
    },
    {
      role: 'admin',
      title: 'Cafeteria Administrator',
      email: 'admin@college.edu',
      password: 'password123',
      description: 'Real-time analytics, food menu CRUD, queue management'
    }
  ]);
});

module.exports = router;

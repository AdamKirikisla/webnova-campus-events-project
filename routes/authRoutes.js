const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db.js');
const { toPublicUser } = require('../utils/users');

// 0. WHO AM I
// The student pages need to know which account is signed in, but the session
// lives on the server. This returns the current user (from req.session), so
// the frontend never has to store or send a user id itself.
router.get('/me', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' });
  }

  try {
    const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [req.session.userId]);

    // The account was deleted while the session was still alive.
    if (rows.length === 0) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Not logged in.' });
    }

    res.json(toPublicUser(rows[0]));
  } catch (error) {
    console.error('Error /auth/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1. REGISTER
router.post('/register', async (req, res) => {
  const { full_name, email, student_id, password } = req.body;

  // Is the request empty? Are all fields filled?
  if (!full_name || !email || !student_id || !password) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  // Double-check email format with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'The email format is invalid.' });
  }

  const studentIdRegex = /^\d{8}$/;
  if (!studentIdRegex.test(student_id)) {
    return res.status(400).json({ error: 'The student ID must be 8 digits.' });
  }

  // Is the password long enough? (8 characters minimum)
  if (password.length < 8) {
    return res.status(400).json({ error: 'The password must be at least 8 characters long.' });
  }

  // Check if the email is already in use
  try {
    const [existingUsers] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'This email is already in use.' });
    }

    // Check if the student ID is already in use
    const [existingStudentId] = await pool.execute('SELECT * FROM Users WHERE student_id = ?', [student_id]);
    if (existingStudentId.length > 0) {
      return res.status(400).json({ error: 'This student ID is already in use.' });
    }

    // Hash the password before storing it in the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    await pool.execute('INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)', [
      full_name,
      email,
      hashedPassword,
      'student',
    ]);

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (error) {
    console.error('Error Register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Is the request empty? Are all fields filled?
  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }

  // Check if given email exists in the database, and if so, compare the hashed password
  try {
    const [users] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Email or password is incorrect.' }); // No clues given to the user about which part is wrong
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Email or password is incorrect.' }); // No clues given to the user about which part is wrong
    }

    req.session.userId = user.user_id;
    req.session.role = user.role;
    req.session.fullName = user.full_name;

    if (user.role === 'admin') {
      res.status(200).json({ redirectUrl: '/admin-dashboard.html' });
    } else {
      res.status(200).json({ redirectUrl: '/student-dashboard.html' });
    }
  } catch (error) {
    console.error('Error Login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error during logout' });
    }
    res.json({ message: 'Logged out successfully', redirectUrl: '/index.html' });
  });
});

module.exports = router;

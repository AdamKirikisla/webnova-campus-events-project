const pool = require('../db');
const { hashPassword, verifyPassword, toSessionUser } = require('../utils/users');

// POST /auth/signup
async function signup(req, res) {
  try {
    const { firstName, lastName, email, password, studentId } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email and password are required.' });
    }

    const [existingEmail] = await pool.execute('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'This email is already in use.' });
    }

    if (studentId) {
      const [existingId] = await pool.execute('SELECT user_id FROM Users WHERE student_id = ?', [studentId]);
      if (existingId.length > 0) {
        return res.status(409).json({ error: 'This student ID is already in use.' });
      }
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const [result] = await pool.execute(
      'INSERT INTO Users (full_name, email, password_hash, role, student_id) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashPassword(password), 'student', studentId || null]
    );

    const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [result.insertId]);
    res.status(201).json(toSessionUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create the account.' });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.execute('SELECT * FROM Users WHERE email = ?', [email]);

    // Same message for "no such user" and "wrong password" so the response
    // does not reveal which emails exist in the database.
    if (rows.length === 0 || !verifyPassword(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json(toSessionUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not log in.' });
  }
}

module.exports = { signup, login };

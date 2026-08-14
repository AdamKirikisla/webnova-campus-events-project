const pool = require('../db');
const { hashPassword, toPublicUser } = require('../utils/users');

// These handlers always act on the account in the session, never on an id
// taken from the URL. That way a student cannot read or edit someone else's
// profile by changing the number in the address bar.

// GET /users/me
async function getMyProfile(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [req.session.userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    res.json(toPublicUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch the user.' });
  }
}

// PATCH /users/me  — used by the student profile page.
// Password is optional: when left blank the existing one is kept.
async function updateMyProfile(req, res) {
  try {
    const id = req.session.userId;
    const { firstName, lastName, email, studentId, password } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name and email are required.' });
    }

    const [existingRows] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ error: 'User not found.' });

    // Email must stay unique across *other* accounts.
    const [emailClash] = await pool.execute('SELECT user_id FROM Users WHERE email = ? AND user_id != ?', [email, id]);
    if (emailClash.length > 0) {
      return res.status(409).json({ error: 'This email is already in use by another account.' });
    }

    let newStudentId = existingRows[0].student_id;

    if (studentId) {
      const studentIdRegex = /^\d{8}$/;
      if (!studentIdRegex.test(studentId)) {
        return res.status(400).json({ error: 'Student ID must be 8 digits.' });
      }

      const [idClash] = await pool.execute('SELECT user_id FROM Users WHERE student_id = ? AND user_id != ?', [
        studentId,
        id,
      ]);
      if (idClash.length > 0) {
        return res.status(409).json({ error: 'This student ID is already registered in the system.' });
      }
    }

    // The two name fields are stored as a single full_name column.
    const fullName = `${firstName} ${lastName}`.trim();

    if (password) {
      // Hashed with bcrypt, matching the login route's comparison.
      await pool.execute(
        'UPDATE Users SET full_name = ?, email = ?, student_id = ?, password_hash = ? WHERE user_id = ?',
        [fullName, email, studentId || null, await hashPassword(password), id]
      );
    } else {
      await pool.execute('UPDATE Users SET full_name = ?, email = ?, student_id = ? WHERE user_id = ?', [
        fullName,
        email,
        studentId || null,
        id,
      ]);
    }

    // Keep the session's cached name in step with the change.
    req.session.fullName = fullName;

    const [updated] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [id]);
    res.json(toPublicUser(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update the profile.' });
  }
}

module.exports = { getMyProfile, updateMyProfile };

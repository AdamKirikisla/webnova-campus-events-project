const pool = require('../db');
const { hashPassword, toSessionUser } = require('../utils/users');

// GET /users/:id
async function getUserById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid user id.' });

    const [rows] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });

    res.json(toSessionUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch the user.' });
  }
}

// PATCH /users/:id  — used by the student profile page.
// Password is optional: when left blank the existing one is kept.
async function updateUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid user id.' });

    const { firstName, lastName, email, studentId, password } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name and email are required.' });
    }

    const [existingRows] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [id]);
    if (existingRows.length === 0) return res.status(404).json({ error: 'User not found.' });

    // Email and student ID must stay unique across *other* accounts.
    const [emailClash] = await pool.execute('SELECT user_id FROM Users WHERE email = ? AND user_id != ?', [email, id]);
    if (emailClash.length > 0) {
      return res.status(409).json({ error: 'This email is already in use by another account.' });
    }

    if (studentId) {
      const [idClash] = await pool.execute('SELECT user_id FROM Users WHERE student_id = ? AND user_id != ?', [
        studentId,
        id,
      ]);
      if (idClash.length > 0) {
        return res.status(409).json({ error: 'This student ID is already registered in the system.' });
      }
    }

    const fullName = `${firstName} ${lastName}`.trim();

    if (password) {
      await pool.execute(
        'UPDATE Users SET full_name = ?, email = ?, student_id = ?, password_hash = ? WHERE user_id = ?',
        [fullName, email, studentId || null, hashPassword(password), id]
      );
    } else {
      await pool.execute('UPDATE Users SET full_name = ?, email = ?, student_id = ? WHERE user_id = ?', [
        fullName,
        email,
        studentId || null,
        id,
      ]);
    }

    const [updated] = await pool.execute('SELECT * FROM Users WHERE user_id = ?', [id]);
    res.json(toSessionUser(updated[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update the profile.' });
  }
}

module.exports = { getUserById, updateUser };

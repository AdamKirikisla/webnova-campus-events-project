const bcrypt = require('bcrypt');

// ------------------------------------------------------------------
// Shared user helpers.
//
// Password hashing uses bcrypt with the same cost factor as the signup
// route in routes/authRoutes.js, so a password changed from the profile
// page stays compatible with the login route.
// ------------------------------------------------------------------

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Shape a Users row into the object the frontend works with.
// The password hash is never included.
//
// The database stores one full_name, but the profile form edits given and
// family name separately, so the name is split on the first space here and
// re-joined when saving.
function toPublicUser(row) {
  const parts = (row.full_name || '').trim().split(/\s+/);
  return {
    user_id: row.user_id,
    name: row.full_name,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    email: row.email,
    studentId: row.student_id || '',
    role: row.role,
  };
}

module.exports = { hashPassword, toPublicUser, SALT_ROUNDS };

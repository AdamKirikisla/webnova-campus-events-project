const crypto = require('crypto');

// ------------------------------------------------------------------
// Shared user helpers, used by authController and userController.
//
// Passwords use Node's built-in crypto (scrypt), so no extra npm
// dependency is needed. Stored format is:  scrypt:<salt-hex>:<hash-hex>
// ------------------------------------------------------------------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || stored.length === 0) return false;

  // The demo rows seeded by schema.sql keep their password in plain text.
  // Support them so the sample accounts still log in after this change.
  if (!stored.startsWith('scrypt:')) {
    return stored === password;
  }

  const [, salt, originalHash] = stored.split(':');
  if (!salt || !originalHash) return false;

  const candidate = Buffer.from(crypto.scryptSync(password, salt, 64).toString('hex'), 'hex');
  const original = Buffer.from(originalHash, 'hex');

  // timingSafeEqual throws if the buffers differ in length
  if (candidate.length !== original.length) return false;
  return crypto.timingSafeEqual(candidate, original);
}

// Shape a Users row into the session object the frontend stores.
// The password hash is never included.
function toSessionUser(row) {
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

module.exports = { hashPassword, verifyPassword, toSessionUser };

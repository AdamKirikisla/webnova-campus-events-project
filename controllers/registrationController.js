const pool = require('../db');

// For admin, view all registrations
async function getAllRegistrations(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, e.title AS event_title, e.event_date, e.category_id
      FROM Registrations r
      INNER JOIN Events e ON r.event_id = e.event_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
}

// Shared query behind both "my registrations" and the admin lookup below.
async function fetchRegistrationsFor(userId) {
  const [rows] = await pool.execute(
    `
      SELECT r.*, e.title AS event_title, e.event_date, e.start_time, e.end_time, e.location
      FROM Registrations r
      INNER JOIN Events e ON r.event_id = e.event_id
      WHERE r.user_id = ?
    `,
    [userId]
  );
  return rows;
}

// The signed-in student's own registrations. Used by "My Events" and the
// student dashboard. The id comes from the session, so a student can only
// ever see their own list.
async function getMyRegistrations(req, res) {
  try {
    res.json(await fetchRegistrationsFor(req.session.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
}

// Look up any student's registrations. Admin only — see registrationRoutes.js.
async function getUserRegistrations(req, res) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    res.json(await fetchRegistrationsFor(userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
}

// Student register action.checks: event open, not full, not already registered, not cancelled, date not passed
async function createRegistration(req, res) {
  try {
    const { event_id } = req.body;

    // The student is taken from the session, never from the request body, so
    // nobody can sign somebody else up for an event.
    const user_id = req.session.userId;

    if (!Number.isInteger(event_id)) {
      return res.status(400).json({ error: 'event_id is required.' });
    }

    const [eventRows] = await pool.execute('SELECT * FROM Events WHERE event_id = ?', [event_id]);
    if (eventRows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = eventRows[0];

    // Check 1: event must be open
    if (event.status !== 'open') {
      return res.status(400).json({ error: `Cannot register — event is ${event.status}.` });
    }

    // Check 2: event date must not have passed
    if (new Date(event.event_date) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Cannot register — event date has already passed.' });
    }

    // Check 3: not already registered
    const [existing] = await pool.execute(
      `SELECT * FROM Registrations WHERE user_id = ? AND event_id = ? AND status != 'cancelled'`,
      [user_id, event_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'You are already registered for this event.' });
    }

    // Check 4: event must not be full — capacity calculated here, server-side
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM Registrations WHERE event_id = ? AND status != 'cancelled'`,
      [event_id]
    );
    const currentCount = countRows[0].count;

    if (currentCount >= event.capacity) {
      return res.status(400).json({ error: 'Cannot register — event is full.' });
    }

    const [result] = await pool.execute('INSERT INTO Registrations (user_id, event_id, status) VALUES (?, ?, ?)', [
      user_id,
      event_id,
      'registered',
    ]);

    res.status(201).json({ message: 'Registered successfully.', registration_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not register for event.' });
  }
}

// Cancel (student) or mark attended/missed (admin's dropdown on View Registrations).
async function updateRegistration(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid registration id.' });
    }

    const { status } = req.body;
    const validStatuses = ['registered', 'cancelled', 'attended', 'missed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const [rows] = await pool.execute('SELECT user_id FROM Registrations WHERE registration_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found.' });
    }

    // A student may only change their own registration (dropping an event, or
    // saying whether they attended). Admins can update anyone's.
    if (req.session.role !== 'admin' && rows[0].user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You can only change your own registrations.' });
    }

    await pool.execute('UPDATE Registrations SET status = ? WHERE registration_id = ?', [status, id]);

    res.json({ message: 'Registration updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update registration.' });
  }
}

// Add to exports:
module.exports = {
  getAllRegistrations,
  getMyRegistrations,
  getUserRegistrations,
  createRegistration,
  updateRegistration,
};

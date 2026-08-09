const pool = require('../db');

// For admin, view all registraions
async function getAllRegistrations(req, res) {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*, e.title AS event_title, e.event_date, e.category
      FROM Registrations r
      INNER JOIN Events e ON r.event_id = e.event_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
}

// Student's own registrations only. Needed for "My Events"/student dashboard
async function getUserRegistrations(req, res) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }

    const [rows] = await pool.execute(
      `
      SELECT r.*, e.title AS event_title, e.event_date, e.start_time, e.end_time, e.location
      FROM Registrations r
      INNER JOIN Events e ON r.event_id = e.event_id
      WHERE r.user_id = ?
    `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
}

// Student register action.checks: event open, not full, not already registered, not cancelled, date not passed
async function createRegistration(req, res) {
  try {
    const { user_id, event_id } = req.body;

    if (!Number.isInteger(user_id) || !Number.isInteger(event_id)) {
      return res.status(400).json({ error: 'user_id and event_id are required.' });
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

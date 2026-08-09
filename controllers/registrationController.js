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

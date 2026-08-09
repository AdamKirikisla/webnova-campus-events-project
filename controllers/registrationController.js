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

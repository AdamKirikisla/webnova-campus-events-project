const pool = require('../db');

async function getAllRegistrations(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, e.title AS event_title, e.event_date, e.capacity, u.full_name
      FROM Registrations r
     INNER JOIN Events e ON r.event_id = e.event_id
     INNER JOIN Users u ON r.user_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch registrations.' });
  }
}

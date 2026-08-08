const pool = require('../db');

async function getAllEvents(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM Events');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch events.' });
  }
}

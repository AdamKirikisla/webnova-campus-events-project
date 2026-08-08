const pool = require('../db');

async function getAllEvents(req, res) {
  const [rows] = await pool.execute('SELECT * FROM Events');
  res.json(rows);
}

async function getEventById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });

  const [rows] = await pool.query('SELECT * FROM Events WHERE event_id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Event not found.' });

  res.json(rows[0]);
}

const pool = require('../db');

async function getAllEvents(req, res) {
  const [rows] = await pool.execute('SELECT * FROM Events');
  res.json(rows);
}

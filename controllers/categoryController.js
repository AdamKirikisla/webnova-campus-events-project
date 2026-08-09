const pool = require('../db');

async function getAllCategories(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM Categories');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch categories.' });
  }
}

module.exports = { getAllCategories };

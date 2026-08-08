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

async function getEventById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });

    const [rows] = await pool.execute('SELECT * FROM Events WHERE event_id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found.' });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch event.' });
  }
}

async function createEvent(req, res) {
  try {
    const { title, description, category, event_date, start_time, end_time, location, capacity, organizer_id } =
      req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Event title cannot be empty.' });
    }
    if (!event_date || isNaN(Date.parse(event_date))) {
      return res.status(400).json({ error: 'Event date must be valid.' });
    }
    if (new Date(event_date) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ error: 'Event date should not be in the past.' });
    }
    if (!capacity || capacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be a positive number.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO Events (title, description, category, event_date, start_time, end_time, location, capacity, organizer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, event_date, start_time, end_time, location, capacity, organizer_id]
    );

    res.status(201).json({ message: 'Event created.', event_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create event.' });
  }
}

async function updateEvent(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });

    const { title, description, category, event_date, start_time, end_time, location, capacity, status } = req.body;

    const [result] = await pool.execute(
      `UPDATE Events SET title = ?, description = ?, category = ?, event_date = ?, start_time = ?,
       end_time = ?, location = ?, capacity = ?, status = ? WHERE event_id = ?`,
      [title, description, category, event_date, start_time, end_time, location, capacity, status, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found.' }); //  records that were actually modified in MySQL
    res.json({ message: 'Event updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update event.' });
  }
}

async function deleteEvent(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid event id.' });

    const [result] = await pool.execute('DELETE FROM Events WHERE event_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found.' }); // none was deleted

    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete event.' });
  }
}

// For exportation because we use type: commonjs
module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };

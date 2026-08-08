require('dotenv').config(); // load .env values into process.env

const express = require('express');
const mysql = require('mysql2/promise'); // the "/promise" version works with async/await

const app = express();
app.use(express.json()); // lets Express read JSON request bodies later

// Connection pool — reuses connections instead of opening a new one per request
// multiple connections (up to connectionLimit, here 10)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Display page
app.use(express.static('view'));
app.use('/public', express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

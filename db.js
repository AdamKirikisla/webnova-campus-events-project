require('dotenv').config();
const mysql = require('mysql2/promise'); // promise if for async usage

// Connection pool — reuses connections instead of opening a new one per request
// multiple connections (up to connectionLimit, here 10)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // // return DATE/DATETIME columns as plain strings like
});

// For exportation because we use type: commonjs
module.exports = pool;

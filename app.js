require('dotenv').config(); // load .env values into process.env

const express = require('express');

const app = express();
app.use(express.json()); // lets Express read JSON request bodies later

// Events
const eventRoutes = require('./routes/eventRoutes');
app.use('/events', eventRoutes);

// Registrations
const registrationRoutes = require('./routes/registrationRoutes');
app.use('/registrations', registrationRoutes);

// Categories
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/categories', categoryRoutes);

// Authentication (signup / login)
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Users (profile read / update)
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// Display page
app.use(express.static('view'));
app.use('/public', express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

require('dotenv').config(); // load .env values into process.env

const express = require('express');
const app = express();

app.use(express.json()); // lets Express read JSON request bodies later
app.use(express.urlencoded({ extended: false })); // lets Express read form data (urlencoded) request bodies later
const session = require('express-session');
app.use(
  session({
    secret: 'super_cle_secrete_webnova', // Dans un vrai projet, ça va dans le .env
    resave: false,
    saveUninitialized: false,
  })
);
// Display page
app.use(express.static('view'));
app.use('/public', express.static('public'));

// Authentication
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Events
const eventRoutes = require('./routes/eventRoutes');
app.use('/events', eventRoutes);

// Registrations
const registrationRoutes = require('./routes/registrationRoutes');
app.use('/registrations', registrationRoutes);

// Categories
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/categories', categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

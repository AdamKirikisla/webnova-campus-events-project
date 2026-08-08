require('dotenv').config(); // load .env values into process.env

const express = require('express');

const app = express();
app.use(express.json()); // lets Express read JSON request bodies later

const eventRoutes = require('./routes/eventRoutes');
app.use('/events', eventRoutes);

// Display page
app.use(express.static('view'));
app.use('/public', express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

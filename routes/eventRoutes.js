// Purpose of routes, mapping URLs to functions (controllers)

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAdmin } = require('../controllers/authMiddleware');

router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', requireAdmin, eventController.createEvent);
router.patch('/:id', requireAdmin, eventController.updateEvent);
router.delete('/:id', requireAdmin, eventController.deleteEvent);

// For exportation because we use type: commonjs
module.exports = router;

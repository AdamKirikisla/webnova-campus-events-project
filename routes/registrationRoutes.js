const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { requireLogin, requireAdmin } = require('../controllers/authMiddleware');

// "/mine" is declared before "/user/:userId" so it is matched as a literal
// path rather than being swallowed by a parameter route.
router.get('/mine', requireLogin, registrationController.getMyRegistrations);

// Admin views: every registration, or one specific student's.
router.get('/', requireAdmin, registrationController.getAllRegistrations);
router.get('/user/:userId', requireAdmin, registrationController.getUserRegistrations);

// Students register themselves; the controller reads the id from the session.
router.post('/', requireLogin, registrationController.createRegistration);

// Drop an event, or mark attended/missed. The controller checks ownership.
router.patch('/:id', requireLogin, registrationController.updateRegistration);

module.exports = router;

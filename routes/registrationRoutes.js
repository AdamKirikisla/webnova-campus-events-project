const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.get('/', registrationController.getAllRegistrations);
router.get('/user/:userId', registrationController.getUserRegistrations);
router.post('/', registrationController.createRegistration);
router.patch('/:id', registrationController.updateRegistration);

module.exports = router;

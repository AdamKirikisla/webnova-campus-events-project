const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireLogin } = require('../controllers/authMiddleware');

// Both routes act on the signed-in account, so a valid session is required.
router.get('/me', requireLogin, userController.getMyProfile);
router.patch('/me', requireLogin, userController.updateMyProfile);

module.exports = router;

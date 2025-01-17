const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Sign Up Route
router.post('/signup', userController.signUp);

// Login Route
router.post('/login', userController.login);

module.exports = router;

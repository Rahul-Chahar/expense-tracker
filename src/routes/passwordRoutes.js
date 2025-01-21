const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

router.post('/forgotpassword', passwordController.forgotPassword);
router.get('/resetpassword/:token', passwordController.verifyResetToken);
router.post('/resetpassword/:token', passwordController.resetPassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticationToken = require('../middlewares/auth');

router.post('/create-order', authenticationToken, paymentController.createOrder);
router.post('/update-status', authenticationToken, paymentController.updateTransactionStatus);

module.exports = router;
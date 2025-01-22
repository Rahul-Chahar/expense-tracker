const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const authenticateToken = require('../middlewares/auth');

router.get('/expenses', authenticateToken, downloadController.downloadExpenses);
router.get('/history', authenticateToken, downloadController.getDownloadHistory);

module.exports = router;
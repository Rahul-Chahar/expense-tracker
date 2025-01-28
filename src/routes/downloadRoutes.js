// routes/downloadRoutes.js
const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const auth = require('../middlewares/auth');

// Route to download expenses as CSV
router.get('/download', auth, downloadController.downloadExpenses);

// Route to get download history
router.get('/download-history', auth, downloadController.getDownloadHistory);

module.exports = router;

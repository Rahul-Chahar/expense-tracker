const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const auth = require('../middlewares/auth');

router.get('/download', auth, downloadController.downloadExpenses);

router.get('/download-history', auth, downloadController.getDownloadHistory);

module.exports = router;

// In routes/premiumRoutes.js
const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const authenticateToken = require('../middlewares/auth');

router.get('/status', authenticateToken, premiumController.getPremiumStatus);
router.get('/showLeaderboard', authenticateToken, premiumController.getLeaderboard);

module.exports = router;
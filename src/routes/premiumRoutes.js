const express = require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const authenticateToken = require('../middlewares/auth');

router.get('/status', authenticateToken, premiumController.getPremiumStatus);
router.get('/leaderboard', authenticateToken, premiumController.getLeaderboard);

module.exports = router;
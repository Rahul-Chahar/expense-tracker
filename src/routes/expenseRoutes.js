const express = require('express');
const expenseController = require('../controllers/expenseController');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();

// Basic CRUD routes
router.post('/add', authenticateToken, expenseController.addExpense);
router.get('/user', authenticateToken, expenseController.getExpenses);
router.delete('/:id', authenticateToken, expenseController.deleteExpense);

// Report and analysis routes
router.get('/report/:type', authenticateToken, expenseController.getReport);

module.exports = router;
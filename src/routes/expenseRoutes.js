const express = require('express');
const expenseController = require('../controllers/expenseController');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();

// Route for adding a new expense
router.post('/add', authenticateToken, expenseController.addExpense);

// Route for fetching all expenses for a user
router.get('/user', authenticateToken, expenseController.getExpenses);

// Route for deleting an expense
router.delete('/:id', authenticateToken, expenseController.deleteExpense);

router.get('/download', authenticateToken, expenseController.downloadExpenses);
router.get('download/history', authenticateToken, expenseController.getDownloadHistory);

module.exports = router;

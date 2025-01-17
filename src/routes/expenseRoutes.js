const express = require('express');
const expenseController = require('../controllers/expenseController');
const router = express.Router();

// Route for adding a new expense
router.post('/add', expenseController.addExpense);

// Route for fetching all expenses for a user
router.get('/:userId', expenseController.getExpenses);

// Route for deleting an expense
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;

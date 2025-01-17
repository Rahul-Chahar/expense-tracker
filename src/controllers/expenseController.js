const Expense = require('../models/Expense');

// Add a new expense
exports.addExpense = async (req, res) => {
    try {
        
    const { userId, amount, description, category } = req.body;

        const expense = await Expense.create({ userId, amount, description, category });
        res.status(201).json({ message: 'Expense added successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error: error.message });
    }
};

// Fetch expenses for a user
exports.getExpenses = async (req, res) => {
    const { userId } = req.params;

    try {
        const expenses = await Expense.findAll({ where: { userId } });
        res.status(200).json({ expenses });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Expense.destroy({ where: { id } });
        if (result) {
            res.status(200).json({ message: 'Expense deleted successfully' });
        } else {
            res.status(404).json({ message: 'Expense not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};

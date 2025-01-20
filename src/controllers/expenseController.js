const { Expense, User } = require('../models/relationships');

// Add a new expense
exports.addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.id;

        const expense = await Expense.create({ 
            userId, 
            amount: parseFloat(amount), // Ensure amount is converted to float
            description, 
            category 
        });

        // Update the totalExpense of the user
        await User.increment('totalExpenses', { 
            by: parseFloat(amount),
            where: { id: userId } 
        });

        res.status(201).json({ 
            success: true,
            message: 'Expense added successfully', 
            expense 
        });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding expense', 
            error: error.message 
        });
    }
};

// Fetch expenses for a user
exports.getExpenses = async (req, res) => {
    try {

    const userId = req.user.id; // Get the user ID from authenticated request

        const expenses = await Expense.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
        res.status(200).json({ expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const expense = await Expense.findOne({
            where: { id, userId }
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found or unauthorized'
            });
        }

        // First update the user's totalExpenses
        await User.decrement('totalExpenses', { 
            by: parseFloat(expense.amount),
            where: { id: userId } 
        });

        // Then delete the expense
        await expense.destroy();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting expense',
            error: error.message
        });
    }
};
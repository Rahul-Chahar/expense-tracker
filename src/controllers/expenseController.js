const { Expense } = require('../models/relationships');

// Add a new expense
exports.addExpense = async (req, res) => {
    try {
        
    const { amount, description, category } = req.body;
    const userId = req.user.id; // Get the user ID from authenticated request

        const expense = await Expense.create({ userId, amount, description, category });
        res.status(201).json({ message: 'Expense added successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error: error.message });
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
        const userId = req.user.id; // Get the user ID from authenticated request

        const expense = await Expense.findOne({
            where: { id, userId }
        });

        if(!expense){
            return res.status(404).json({message: 'Expense not found or unauthorized'});
        }

        await expense.destroy();
        res.status(200).json({ message: 'Expense deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};

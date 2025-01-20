const { Expense, User } = require('../models/relationships');
const sequelize = require('../database/sequelize');

exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.id;
        const parsedAmount = parseFloat(amount);

        // Create the expense
        const expense = await Expense.create({ 
            userId, 
            amount: parsedAmount,
            description, 
            category 
        }, { transaction: t });

        // Get current user
        const user = await User.findByPk(userId, { transaction: t });
        const currentTotal = user.totalExpenses || 0;
        
        // Update total expenses
        await User.update(
            { totalExpenses: currentTotal + parsedAmount },
            { 
                where: { id: userId },
                transaction: t 
            }
        );

        await t.commit();

        res.status(201).json({ 
            success: true,
            message: 'Expense added successfully', 
            expense 
        });
    } catch (error) {
        await t.rollback();
        console.error('Error adding expense:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding expense', 
            error: error.message 
        });
    }
};

exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const userId = req.user.id;

        const expense = await Expense.findOne({
            where: { id, userId },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Expense not found or unauthorized'
            });
        }

        // Get current user
        const user = await User.findByPk(userId, { transaction: t });
        const currentTotal = user.totalExpenses || 0;
        
        // Update total expenses
        await User.update(
            { totalExpenses: currentTotal - expense.amount },
            { 
                where: { id: userId },
                transaction: t 
            }
        );

        // Delete the expense
        await expense.destroy({ transaction: t });
        
        await t.commit();

        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error deleting expense:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting expense',
            error: error.message
        });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.findAll({ 
            where: { userId }, 
            order: [['createdAt', 'DESC']] 
        });
        
        res.status(200).json({ expenses });
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ 
            message: 'Error fetching expenses', 
            error: error.message 
        });
    }
};
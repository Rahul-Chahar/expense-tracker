// expenseController.js
const { Expense, User } = require('../models/relationships');
const sequelize = require('../database/sequelize');

exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.id;

        const expense = await Expense.create({ 
            userId, 
            amount: parseFloat(amount),
            description, 
            category 
        }, { transaction: t });

        await User.update(
            { totalExpenses: sequelize.literal(`totalExpenses + ${parseFloat(amount)}`) },
            { where: { id: userId }, transaction: t }
        );

        await t.commit();
        return res.status(201).json({ expense });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ message: 'Error adding expense' });
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
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }

        await User.update(
            { totalExpenses: sequelize.literal(`totalExpenses - ${expense.amount}`) },
            { where: { id: userId }, transaction: t }
        );

        await expense.destroy({ transaction: t });
        await t.commit();
        
        return res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ message: 'Error deleting expense' });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.findAll({ 
            where: { userId }, 
            order: [['createdAt', 'DESC']] 
        });
        
        return res.status(200).json({ expenses });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching expenses' });
    }
};
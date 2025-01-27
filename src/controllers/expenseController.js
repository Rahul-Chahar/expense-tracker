const { Expense, User } = require('../models/relationships');
const sequelize = require('../database/sequelize');
const { Op } = require('sequelize');

exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category, type } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        await Expense.create({ userId, amount, description, category, type }, { transaction: t });

        if (type === 'expense') {
            const totalExpenses = await Expense.sum('amount', {
                where: { userId, type: 'expense' },
                transaction: t
            }) || 0;
            await User.update({ totalExpenses }, { where: { id: userId }, transaction: t });
        }

        await t.commit();
        return res.status(201).json({ message: 'Transaction added successfully' });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const expense = await Expense.findOne({
            where: { id: req.params.id, userId: req.user.id },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await expense.destroy({ transaction: t });

        if (expense.type === 'expense') {
            const totalExpenses = await Expense.sum('amount', {
                where: { userId: req.user.id, type: 'expense' },
                transaction: t
            }) || 0;
            await User.update({ totalExpenses }, { where: { id: req.user.id }, transaction: t });
        }

        await t.commit();
        return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ message: error.message });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ expenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReport = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.isPremium) return res.status(403).json({ message: 'Premium feature only' });

        let startDate = new Date();
        switch(req.params.type) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yearly':
                startDate.setMonth(0, 1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const transactions = await Expense.findAll({
            where: {
                userId: req.user.id,
                createdAt: { [Op.gte]: startDate }
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            transactions,
            summary: transactions.reduce((s, t) => {
                t.type === 'income' ? s.totalIncome += t.amount : s.totalExpense += t.amount;
                s.savings = s.totalIncome - s.totalExpense;
                return s;
            }, { totalIncome: 0, totalExpense: 0, savings: 0 })
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating report' });
    }
};

module.exports = exports;
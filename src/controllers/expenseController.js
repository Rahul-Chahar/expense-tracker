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

exports.downloadExpenses = async (req, res) => {
    try {
        // Check premium status
        const user = await User.findByPk(req.user.id);
        if (!user.isPremium) {
            return res.status(401).json({ message: 'Premium feature only' });
        }

        // Get user's expenses
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        // Create CSV content
        const csvContent = [
            ['Date', 'Description', 'Category', 'Amount'].join(','),
            ...expenses.map(expense => [
                new Date(expense.createdAt).toLocaleDateString(),
                expense.description,
                expense.category,
                expense.amount
            ].join(','))
        ].join('\n');

        // Generate filename
        const fileName = `expenses_${req.user.id}_${Date.now()}.csv`;

        // Save file URL in database
        const downloadUrl = await saveToS3(csvContent, fileName); // Implement this function
        await DownloadedFile.create({
            userId: req.user.id,
            fileUrl: downloadUrl,
            fileName
        });

        res.json({ fileUrl: downloadUrl });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Error generating download' });
    }
};

exports.getDownloadHistory = async (req, res) => {
    try {
        const downloads = await DownloadedFile.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({ downloads });
    } catch (error) {
        console.error('Error fetching download history:', error);
        res.status(500).json({ message: 'Error fetching download history' });
    }
};
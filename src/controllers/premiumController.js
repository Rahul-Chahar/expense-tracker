const { User, Expense } = require('../models/relationships');
const { Sequelize } = require('sequelize');
const sequelize = require('../database/sequelize' )// Adjust this path to where your database connection is configured

exports.getPremiumStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.status(200).json({ isPremium: user.isPremium });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching premium status' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboardData = await User.findAll({
            attributes: [
                'name',
                [sequelize.fn('IFNULL', sequelize.fn('SUM', sequelize.col('Expenses.amount')), 0), 'totalExpenses']
            ],
            include: [{
                model: Expense,
                attributes: [],
                required: false
            }],
            group: ['User.id', 'User.name'],
            order: [[sequelize.literal('totalExpenses'), 'DESC']]
        });

        // Format the response to ensure proper number values
        const formattedLeaderboard = leaderboardData.map(user => ({
            name: user.name,
            totalExpenses: Number(user.getDataValue('totalExpenses')) || 0
        }));

        res.status(200).json(formattedLeaderboard);
    } catch (error) {
        console.error('Error in getLeaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

// Helper function if you need to update a specific user's expenses
exports.updateUserTotalExpenses = async (userId) => {
    try {
        const total = await Expense.sum('amount', {
            where: { userId: userId }
        });
        
        await User.update(
            { totalExpenses: total || 0 },
            { where: { id: userId } }
        );
        
        return total || 0;
    } catch (error) {
        console.error(`Error updating expenses for user ${userId}:`, error);
        throw error;
    }
};
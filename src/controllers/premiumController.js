const { User } = require('../models/relationships');

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
        const users = await User.findAll({
            attributes: ['name', 'totalExpenses'],
            order: [['totalExpenses', 'DESC']]
        });

        const formattedLeaderboard = users.map(user => ({
            name: user.name,
            totalExpenses: Number(user.totalExpenses) || 0
        }));

        res.status(200).json(formattedLeaderboard);
    } catch (error) {
        console.error('Error in getLeaderboard:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message 
        });
    }
};
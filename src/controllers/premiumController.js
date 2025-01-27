const { User } = require('../models/relationships');

exports.getPremiumStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({ isPremium: user.isPremium });
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

        res.json(users.map(user => ({
            name: user.name,
            totalExpenses: Number(user.totalExpenses) || 0
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

module.exports = exports;
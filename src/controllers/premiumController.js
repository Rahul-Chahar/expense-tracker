const { User, Expense } = require('../models/relationships');
const sequelize = require('../database/sequelize');

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
            order: [['totalExpenses', 'DESC']]  // Sort by totalExpenses in descending order
        });

        const formattedLeaderboard = users.map(user => ({
            name: user.name,
            totalExpenses: Number(user.totalExpenses) || 0  // Convert to number, use 0 if null
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

exports.recalculateAllUserExpenses = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const users = await User.findAll({ transaction: t });
        
        for (const user of users) {
            const totalExpense = await Expense.sum('amount', {
                where: { userId: user.id },
                transaction: t
            }) || 0;
            
            await User.update(
                { totalExpenses: totalExpense },
                { 
                    where: { id: user.id },
                    transaction: t 
                }
            );
        }
        
        await t.commit();
        res.status(200).json({ message: 'All user expenses recalculated successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Error recalculating user expenses:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error recalculating user expenses',
            error: error.message 
        });
    }
};
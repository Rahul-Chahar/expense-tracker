const { User, Expense } = require('../models/relationships');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Sign Up Controller
exports.signUp = async (req, res) => {
    try {

    const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Login Controller
// In userController.js, modify the login controller to handle token refresh
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If password is provided, verify it (normal login)
        if (password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }
        }
        // If no password provided, assume token refresh (after premium upgrade)
        else {
            // Verify the request is authenticated
            if (!req.headers.authorization) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        }

        // Generate new JWT token with updated premium status
        const token = jwt.sign(
            { 
                userId: user.id,
                isPremium: user.isPremium,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'User login successful',
            token: token,
            isPremium: user.isPremium
        });
    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
};
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
        // Get all users
        const users = await User.findAll({
            include: [{
                model: Expense,
                attributes: ['amount']
            }]
        });

        // Calculate totals and format response
        const leaderboardData = users.map(user => ({
            name: user.name,
            totalExpenses: user.Expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
        }));

        // Sort by total expenses in descending order
        leaderboardData.sort((a, b) => b.totalExpenses - a.totalExpenses);

        res.status(200).json(leaderboardData);
    } catch (error) {
        console.error('Error in getLeaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

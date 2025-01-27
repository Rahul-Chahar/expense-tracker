const { User } = require('../models/relationships');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (await User.findOne({ where: { email } })) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 10)
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        res.status(200).json({
            message: 'Login successful',
            token: jwt.sign(
                { userId: user.id, isPremium: user.isPremium, email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            ),
            isPremium: user.isPremium
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in user' });
    }
};

module.exports = exports;
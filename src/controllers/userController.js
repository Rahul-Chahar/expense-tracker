const bcrypt = require('bcrypt');
const User = require('../models/User');

const signupUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: 'User registered successfully!',
            user,
        });
    } catch (error) {
        console.error('Error creating user:', error.message); // Log the specific error
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

module.exports = { signupUser };

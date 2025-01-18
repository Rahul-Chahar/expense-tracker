const { User } = require('../models/relationships');
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
exports.login = async (req, res)=>{
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });

        if(!user){
            return res.status(404).json({message: 'User not found'});
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid password'});
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Login successful
        res.status(200).json({
            message: 'User login successful',
            token: token,
        });
    } 
    catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ message: 'Error logging in user', error: error.message });
    }
};

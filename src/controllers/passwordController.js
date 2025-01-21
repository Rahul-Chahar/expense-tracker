const { User } = require('../models/relationships');
const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

// Configure SendinBlue
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received request for email:', email); // Debug log
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('User not found for email:', email); // Debug log
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const transactionalEmailsApi = new Sib.TransactionalEmailsApi();
        
        const sender = { 
            email: 'rahulgchahar@gmail.com', 
            name: 'Expense Tracker' 
        };
        const receivers = [{ email }];
        
        console.log('Sending email via SendinBlue...'); // Debug log
        await transactionalEmailsApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Password Reset Request',
            textContent: 'You requested a password reset for your Expense Tracker account.',
            htmlContent: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset for your Expense Tracker account.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="http://localhost:8080/reset-password?token=${user.id}">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
        console.log('Email sent successfully'); // Debug log

        res.status(200).json({
            success: true,
            message: 'Password reset link sent successfully'
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending password reset link',
            error: error.message
        });
    }
};
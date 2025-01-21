// controllers/passwordController.js
const { User, ForgotPasswordRequest } = require('../models/relationships');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Processing forgot password for email:', email);
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create reset request
        const resetRequest = await ForgotPasswordRequest.create({
            userId: user.id
        });

        // SendinBlue API Configuration
        const defaultClient = Sib.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

        const apiInstance = new Sib.TransactionalEmailsApi();
        
        // Fixed URL formation
        const resetUrl = `http://localhost:3000/password/resetpassword/${resetRequest.id}`;
        console.log('Reset URL:', resetUrl); // Debug log

        const sendSmtpEmail = {
            to: [{ email: email }],
            sender: { 
                email: "rahulgchahar@gmail.com",
                name: "Expense Tracker"
            },
            subject: "Password Reset Request",
            htmlContent: `
                <h1>Reset Your Password</h1>
                <p>You requested to reset your password.</p>
                <p>Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire after use.</p>
            `
        };

        try {
            const emailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('Email sent successfully:', emailResponse);

            return res.status(200).json({
                success: true,
                message: 'Password reset link sent to your email'
            });
        } catch (emailError) {
            console.error('SendinBlue API Error:', emailError.response?.text || emailError.message);
            await resetRequest.destroy();
            return res.status(500).json({
                success: false,
                message: 'Error sending reset email. Please try again later.'
            });
        }
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Verifying token:', token);
        
        const resetRequest = await ForgotPasswordRequest.findOne({
            where: {
                id: token,
                isActive: true
            }
        });

        if (!resetRequest) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset link'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Valid reset token'
        });
    } catch (error) {
        console.error('Error in verifyResetToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying token'
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        console.log('Processing password reset for token:', token);

        const resetRequest = await ForgotPasswordRequest.findOne({
            where: {
                id: token,
                isActive: true
            }
        });

        if (!resetRequest) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset link'
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and deactivate reset request
        await Promise.all([
            User.update(
                { password: hashedPassword },
                { where: { id: resetRequest.userId } }
            ),
            ForgotPasswordRequest.update(
                { isActive: false },
                { where: { id: token } }
            )
        ]);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = exports;
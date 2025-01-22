const { Expense, User, DownloadedFile } = require('../models/relationships');
const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

exports.downloadExpenses = async (req, res) => {
    try {
        // Check if user is premium
        const user = await User.findByPk(req.user.id);
        if (!user.isPremium) {
            return res.status(401).json({ message: 'Premium feature only' });
        }

        // Get user's expenses
        const expenses = await Expense.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        // Create CSV content
        const csvContent = [
            ['Date', 'Description', 'Category', 'Amount'].join(','),
            ...expenses.map(expense => [
                new Date(expense.createdAt).toLocaleDateString(),
                expense.description,
                expense.category,
                expense.amount
            ].join(','))
        ].join('\n');

        // Generate unique filename
        const fileName = `expenses_${req.user.id}_${Date.now()}.csv`;

        // Upload to S3
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: csvContent,
            ContentType: 'text/csv'
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        // Save download record
        await DownloadedFile.create({
            userId: req.user.id,
            fileUrl: uploadResult.Location,
            fileName: fileName
        });

        res.status(200).json({
            fileUrl: uploadResult.Location,
            message: 'File generated successfully'
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Error generating download' });
    }
};

exports.getDownloadHistory = async (req, res) => {
    try {
        // Check if user is premium
        const user = await User.findByPk(req.user.id);
        if (!user.isPremium) {
            return res.status(401).json({ message: 'Premium feature only' });
        }

        const downloads = await DownloadedFile.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({ downloads });
    } catch (error) {
        console.error('Error fetching download history:', error);
        res.status(500).json({ message: 'Error fetching download history' });
    }
};

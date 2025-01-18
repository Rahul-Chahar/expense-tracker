// controllers/paymentController.js
const Razorpay = require('razorpay');
const { Order, User } = require('../models/relationships');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        const options = {
            amount: 2500, // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: "order_receipt_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        await Order.create({
            userId: req.user.id,
            orderId: order.id,
            status: 'PENDING'
        });

        res.json({
            order_id: order.id,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id, status } = req.body;

        // Use Promise.all for parallel execution
        await Promise.all([
            Order.update(
                { 
                    status: status,
                    paymentId: payment_id 
                },
                { where: { orderId: order_id } }
            ),
            status === 'SUCCESSFUL' ? 
                User.update(
                    { isPremium: true },
                    { where: { id: req.user.id } }
                ) : null
        ].filter(Boolean));

        res.json({ message: `Transaction ${status.toLowerCase()}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating transaction' });
    }
};
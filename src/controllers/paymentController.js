const Razorpay = require('razorpay');
const { Order, User } = require('../models/relationships');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: 2500,
            currency: "INR",
            receipt: `order_${Date.now()}`
        });

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
        res.status(500).json({ message: 'Error creating order' });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const { payment_id, order_id, status } = req.body;

        if (status === 'SUCCESSFUL') {
            await Promise.all([
                Order.update(
                    { status, paymentId: payment_id },
                    { where: { orderId: order_id } }
                ),
                User.update(
                    { isPremium: true },
                    { where: { id: req.user.id } }
                )
            ]);
            
            return res.json({ 
                success: true,
                message: 'Payment successful',
                isPremium: true 
            });
        }

        await Order.update(
            { status, paymentId: payment_id },
            { where: { orderId: order_id } }
        );
        
        res.json({ 
            success: true,
            message: `Transaction ${status.toLowerCase()}`,
            isPremium: false 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating transaction' 
        });
    }
};

module.exports = exports;
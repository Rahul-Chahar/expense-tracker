// In controllers/paymentController.js
const Razorpay = require('razorpay');
const { Order, User } = require('../models/relationships');  // Make sure Order is imported here

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        console.log('Creating order for user:', req.user.id);
        const options = {
            amount: 2500, // Amount in paise (₹25.00)
            currency: "INR",
            receipt: `order_receipt_${Date.now()}`
        };

        // Create Razorpay order
        const order = await razorpay.orders.create(options);
        console.log('Order created:', order);

        // Create order in database
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
        console.error('Error in createOrder:', error);
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
            // Return updated premium status
            res.json({ 
                success: true,
                message: 'Payment successful',
                isPremium: true 
            });
        } else {
            await Order.update(
                { status, paymentId: payment_id },
                { where: { orderId: order_id } }
            );
            res.json({ 
                success: true,
                message: `Transaction ${status.toLowerCase()}`,
                isPremium: false 
            });
        }
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating transaction' 
        });
    }
};

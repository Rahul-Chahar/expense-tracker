const {DataTypes} = require('sequelize');
const sequelize = require('../database/sequelize');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING'
    },
    paymentId: {
        type: DataTypes.STRING,
    }
});

module.exports = Order;
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2), // Changed from FLOAT for better precision
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01
        }
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    type: {
        type: DataTypes.ENUM('income', 'expense'),
        allowNull: false,
        defaultValue: 'expense',
        validate: {
            isIn: [['income', 'expense']]
        }
    }
});

module.exports = Expense;
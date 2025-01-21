const User = require('./User');
const Expense = require('./Expense');
const Order = require('./Order');
const ForgotPasswordRequest = require('./ForgotPasswordRequest');

// Define relationships
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

// Add Order relationship
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Add ForgotPasswordRequest relationship
User.hasMany(ForgotPasswordRequest, { foreignKey: 'userId' });
ForgotPasswordRequest.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Expense, Order, ForgotPasswordRequest };
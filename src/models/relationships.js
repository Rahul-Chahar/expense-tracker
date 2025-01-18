const User = require('./User');
const Expense = require('./Expense');

// Define relationships
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Expense };
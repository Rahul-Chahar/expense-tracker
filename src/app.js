const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const sequelize = require('./database/sequelize');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
// Import relationships
require('./models/relationships');

dotenv.config();

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes); // User signup and login routes
app.use('/api/expenses', expenseRoutes); // Expense routes

// Default route to serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html')); // Serve the signup page
});

// Sync the database
(async () => {
    try {
        await sequelize.sync({ alter: false }); // Sync models with database
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error.message);
    }
})();

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

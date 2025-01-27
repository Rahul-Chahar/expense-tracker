const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const sequelize = require('./database/sequelize');
require('dotenv').config();
require('./models/relationships');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(compression());
app.use(express.static(path.join(__dirname, '../public')));

// Database setup
async function syncDatabase() {
    try {
        const [columns] = await sequelize.query("SHOW COLUMNS FROM Expenses LIKE 'type'");
        
        if (!columns.length) {
            await sequelize.query(
                "ALTER TABLE Expenses ADD COLUMN type ENUM('income', 'expense') NOT NULL DEFAULT 'expense'"
            );
        }
        await sequelize.sync({ alter: false });
    } catch (error) {
        console.error('Database sync failed:', error);
        throw error;
    }
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/premium', require('./routes/premiumRoutes'));
app.use('/api/password', require('./routes/passwordRoutes'));

// Static routes
app.get('/password/resetpassword/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reset-password.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// Start server
async function startServer() {
    try {
        await syncDatabase();
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
}

startServer();
// app.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const sequelize = require('./database/sequelize');
require('./models/relationships');

// Routes imports
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(compression());

// Database setup
async function syncDatabase() {
    try {
        // First check if column exists
        const [columns] = await sequelize.query(
            "SHOW COLUMNS FROM Expenses LIKE 'type'"
        );

        if (columns.length === 0) {
            // Add the column if it doesn't exist
            await sequelize.query(
                "ALTER TABLE Expenses ADD COLUMN type ENUM('income', 'expense') NOT NULL DEFAULT 'expense'"
            );
        }

        await sequelize.sync({ alter: false });
        console.log('Database synced successfully');
    } catch (error) {
        console.error('Database sync error:', error);
        throw error;
    }
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/password', passwordRoutes);

app.get('/password/resetpassword/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reset-password.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// Server start
const startServer = async () => {
    try {
        await syncDatabase();
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Server start error:', error);
        process.exit(1);
    }
};

startServer();
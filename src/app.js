const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./database/sequelize'); // Database connection
const User = require('./models/User'); // Import the User model

dotenv.config();

const app = express();
app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Sync the database
(async () => {
    try {
        await sequelize.sync({ alter: true }); // Sync models with database
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error.message);
    }
})();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

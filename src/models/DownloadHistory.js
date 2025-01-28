// models/DownloadHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const DownloadHistory = sequelize.define('DownloadHistory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    downloadedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = DownloadHistory;

const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const DownloadedFile = sequelize.define('DownloadedFile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = DownloadedFile;
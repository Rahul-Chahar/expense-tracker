// models/Download.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/sequelize');

const Download = sequelize.define('Download', {
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
    },
    downloadedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
 });

module.exports = Download;
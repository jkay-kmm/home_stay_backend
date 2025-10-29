const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// @desc    Get database and server stats
// @route   GET /api/system/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    // Database connection stats
    const dbStats = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    };

    // Connection pool stats (if available)
    const poolStats = mongoose.connection.db ? 
      await mongoose.connection.db.admin().serverStatus() : null;

    // Server memory usage
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
      success: true,
      data: {
        database: dbStats,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(process.uptime()) + ' seconds',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system stats',
      error: err.message
    });
  }
};

module.exports = { getStats };
const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const { pool } = require('../config/db');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  res.json(new ApiResponse(true, 'Server is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  }));
}));

router.get('/db', asyncHandler(async (_req, res) => {
  const { rows } = await pool.query('SELECT NOW() AS time, current_database() AS database');
  res.json(new ApiResponse(true, 'Database connected', rows[0]));
}));

module.exports = router;

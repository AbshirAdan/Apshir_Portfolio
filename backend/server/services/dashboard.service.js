const DashboardRepository = require('../repositories/dashboard.repository');
const { pool } = require('../config/db');
const TABLES = require('../database/tables');

const repo = new DashboardRepository();

const getStats = async () => {
  const data = await repo.getStats();
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM ${TABLES.VISITOR_LOGS}`);
  return {
    ...data.counts,
    visitors: rows[0].count,
  };
};

const getRecentActivity = async () => {
  const data = await repo.getStats();
  return data.recentActivity.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.label,
    description: `New ${row.type} added`,
    created_at: row.created_at,
  }));
};

module.exports = { getStats, getRecentActivity };

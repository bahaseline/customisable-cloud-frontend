const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function queryRows(text, params) {
  const result = await pool.query(text, params);
  return result.rows;
}

// For statements whose result rows are irrelevant (UPDATE/INSERT without RETURNING).
async function execute(text, params) {
  await pool.query(text, params);
}

async function queryOne(text, params) {
  const rows = await queryRows(text, params);
  return rows[0];
}

module.exports = { pool, queryRows, queryOne, execute };

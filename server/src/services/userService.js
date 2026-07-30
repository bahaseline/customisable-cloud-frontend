const { pool } = require('../db');
const { encrypt } = require('./cryptoService');

async function upsertUser({ googleId, email, name, accessToken, refreshToken }) {
  const result = await pool.query(
    `INSERT INTO users (google_id, email, name, access_token, refresh_token)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email,
           name = EXCLUDED.name,
           access_token = EXCLUDED.access_token,
           refresh_token = COALESCE(EXCLUDED.refresh_token, users.refresh_token)
     RETURNING id, google_id, email, name`,
    [googleId, email, name, encrypt(accessToken), encrypt(refreshToken)]
  );
  return result.rows[0];
}

module.exports = { upsertUser };

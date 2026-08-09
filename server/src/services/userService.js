const { queryOne } = require('../db');
const { encrypt } = require('./cryptoService');

async function upsertUser({ googleId, email, name, accessToken, refreshToken }) {
  return queryOne(
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
}

async function getUserByEmail(email) {
  return queryOne('SELECT id, google_id, email, name FROM users WHERE LOWER(email) = LOWER($1)', [
    email,
  ]);
}

module.exports = { upsertUser, getUserByEmail };

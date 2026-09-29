const { queryOne, execute } = require('../db');
const { encrypt } = require('./cryptoService');

async function upsertUser({ googleId, email, name, picture, accessToken, refreshToken }) {
  return queryOne(
    `INSERT INTO users (google_id, email, name, picture, access_token, refresh_token)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (google_id) DO UPDATE
       SET email = EXCLUDED.email,
           name = EXCLUDED.name,
           picture = EXCLUDED.picture,
           access_token = EXCLUDED.access_token,
           refresh_token = COALESCE(EXCLUDED.refresh_token, users.refresh_token)
     RETURNING id, google_id, email, name, picture`,
    [googleId, email, name, picture, encrypt(accessToken), encrypt(refreshToken)]
  );
}

async function getUserById(userId) {
  return queryOne('SELECT id, google_id, email, name, picture FROM users WHERE id = $1', [userId]);
}

async function getUserByEmail(email) {
  return queryOne(
    'SELECT id, google_id, email, name, picture FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
}

async function clearTokens(userId) {
  await execute('UPDATE users SET access_token = NULL, refresh_token = NULL WHERE id = $1', [userId]);
}

module.exports = { upsertUser, getUserById, getUserByEmail, clearTokens };

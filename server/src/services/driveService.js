const { google } = require('googleapis');
const { pool, queryOne } = require('../db');
const { encrypt, decrypt } = require('./cryptoService');

const PAGE_SIZE = 1000; // Drive API's maximum page size

async function getUserTokens(userId) {
  return queryOne('SELECT access_token, refresh_token FROM users WHERE id = $1', [userId]);
}

async function persistRefreshedTokens(userId, tokens) {
  if (!tokens.access_token && !tokens.refresh_token) return;

  await pool.query(
    `UPDATE users
     SET access_token = COALESCE($2, access_token),
         refresh_token = COALESCE($3, refresh_token)
     WHERE id = $1`,
    [userId, encrypt(tokens.access_token), encrypt(tokens.refresh_token)]
  );
}

function buildOAuthClient(userId, tokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oauth2Client.setCredentials({
    access_token: decrypt(tokens.access_token),
    refresh_token: decrypt(tokens.refresh_token),
  });

  // googleapis auto-refreshes expired access tokens; persist the rotated
  // token back to the DB so future requests don't need to refresh again.
  oauth2Client.on('tokens', (rotated) => {
    persistRefreshedTokens(userId, rotated).catch((err) => console.error(err));
  });

  return oauth2Client;
}

async function getDriveClient(userId) {
  const tokens = await getUserTokens(userId);
  if (!tokens) {
    throw new Error('User not found');
  }

  const oauth2Client = buildOAuthClient(userId, tokens);
  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function listFiles(userId, { pageToken } = {}) {
  const drive = await getDriveClient(userId);

  const response = await drive.files.list({
    pageSize: PAGE_SIZE,
    pageToken,
    fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, iconLink, webViewLink)',
  });

  return {
    files: response.data.files,
    nextPageToken: response.data.nextPageToken || null,
  };
}

async function getFile(userId, fileId) {
  const drive = await getDriveClient(userId);

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, modifiedTime, iconLink, webViewLink',
  });

  return response.data;
}

module.exports = { listFiles, getFile };

const { google } = require('googleapis');
const { queryOne, execute } = require('../db');
const { encrypt, decrypt } = require('./cryptoService');

const PAGE_SIZE = 1000; // Drive API's maximum page size

// Google-native files hold no downloadable bytes; they must be exported to a
// concrete format before they can be streamed.
const NATIVE_EXPORT_TYPES = {
  'application/vnd.google-apps.document': 'application/pdf',
  'application/vnd.google-apps.spreadsheet': 'application/pdf',
  'application/vnd.google-apps.presentation': 'application/pdf',
  'application/vnd.google-apps.drawing': 'application/pdf',
};

const FILE_FIELDS = 'id, name, mimeType, modifiedTime, iconLink, webViewLink, size';

// The Drive integration owns translating Google's errors into HTTP semantics,
// so controllers can stay thin and simply let failures propagate.
const DRIVE_ERRORS = {
  404: 'File not found',
  403: 'You do not have permission to read this file',
};

function asAppError(err) {
  const status = DRIVE_ERRORS[err.code] ? err.code : 502;
  const appErr = new Error(DRIVE_ERRORS[status] || 'Failed to reach Google Drive');
  appErr.status = status;
  appErr.cause = err;
  return appErr;
}

async function getUserTokens(userId) {
  return queryOne('SELECT access_token, refresh_token FROM users WHERE id = $1', [userId]);
}

async function persistRefreshedTokens(userId, tokens) {
  if (!tokens.access_token && !tokens.refresh_token) return;

  await execute(
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
  try {
    const drive = await getDriveClient(userId);
    const response = await drive.files.list({
      pageSize: PAGE_SIZE,
      pageToken,
      fields: `nextPageToken, files(${FILE_FIELDS})`,
    });

    return {
      files: response.data.files,
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (err) {
    throw asAppError(err);
  }
}

async function getFile(userId, fileId) {
  try {
    const drive = await getDriveClient(userId);
    const response = await drive.files.get({ fileId, fields: FILE_FIELDS });
    return response.data;
  } catch (err) {
    throw asAppError(err);
  }
}

async function getFileContent(userId, fileId) {
  let drive;
  let meta;
  try {
    drive = await getDriveClient(userId);
    ({ data: meta } = await drive.files.get({ fileId, fields: FILE_FIELDS }));
  } catch (err) {
    throw asAppError(err);
  }

  if (meta.mimeType === 'application/vnd.google-apps.folder') {
    const err = new Error('Folders have no content to stream');
    err.status = 400;
    throw err;
  }

  const exportType = NATIVE_EXPORT_TYPES[meta.mimeType];
  let response;
  try {
    response = exportType
      ? await drive.files.export({ fileId, mimeType: exportType }, { responseType: 'stream' })
      : await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  } catch (err) {
    throw asAppError(err);
  }

  return {
    stream: response.data,
    mimeType: exportType || meta.mimeType,
    name: exportType ? `${meta.name}.pdf` : meta.name,
  };
}

module.exports = { listFiles, getFile, getFileContent };

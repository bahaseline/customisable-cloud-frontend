const { google } = require('googleapis');
const { queryOne, execute } = require('../db');
const { encrypt, decrypt } = require('./cryptoService');
const { clearTokens } = require('./userService');

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

// Wraps a Google Drive API error in an app-specific error with a user-facing message and an HTTP status code. The original error is attached as the cause.
function appError(message, status) {
  const err = new Error(message);
  err.status = status;
  err.isAppError = true;
  return err;
}

function asAppError(err) {
  if (err.isAppError) return err;

  // Google revoked the grant (testing-mode 7-day expiry, user revoked from
  // Google Account settings, or too many outstanding tokens). Signal re-login.
  if (err.message?.includes('invalid_grant') || err.message?.includes('Token has been expired or revoked')) {
    return appError('Your Google session has expired. Please sign in again.', 401);
  }

  const status = DRIVE_ERRORS[err.code] ? err.code : 502;
  const wrapped = new Error(DRIVE_ERRORS[status] || 'Failed to reach Google Drive');
  wrapped.status = status;
  wrapped.cause = err;
  return wrapped;
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
  if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
    // The user has either never granted Drive access, or has revoked it from their Google Account settings. Either way, the grant is no longer usable and the user must re-authenticate to continue.
    throw appError('Google Drive access has been disconnected. Please sign in again.', 401);
  }

  const oauth2Client = buildOAuthClient(userId, tokens);
  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Revokes the user's Google Drive access by revoking the underlying Google grant and clearing the stored tokens. If the user has already revoked the grant from their own Google Account settings, this will still clear the stored tokens.
async function revokeGoogleAccess(userId) {
  const tokens = await getUserTokens(userId);
  if (!tokens || (!tokens.access_token && !tokens.refresh_token)) return;

  const tokenToRevoke = decrypt(tokens.refresh_token) || decrypt(tokens.access_token);
  if (tokenToRevoke) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    try {
      await oauth2Client.revokeToken(tokenToRevoke);
    } catch (err) {
      console.error('Google token revocation failed:', err.message);
    }
  }

  await clearTokens(userId);
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
    throw appError('Folders have no content to stream', 400);
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

module.exports = { listFiles, getFile, getFileContent, revokeGoogleAccess };

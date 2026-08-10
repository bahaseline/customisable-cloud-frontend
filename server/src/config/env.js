// Fail fast on misconfiguration.
const REQUIRED = [
  'DATABASE_URL',
  'JWT_SECRET',
  'TOKEN_ENCRYPTION_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
];

function assertEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Copy server/.env.example to server/.env and fill these in.');
    process.exit(1);
  }

  // refuse rather than run unprotected.
  if (process.env.NODE_ENV === 'test') {
    console.error('Refusing to start with NODE_ENV=test: rate limiting would be disabled.');
    console.error('This usually means .env.test was deployed or copied over .env.');
    process.exit(1);
  }
}

module.exports = { assertEnv };

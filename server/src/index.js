require('dotenv').config();
const { assertEnv } = require('./config/env');

assertEnv();

const app = require('./app');
const { pool } = require('./db');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// It stops accepting new connections, but lets in-flight requests finish before exiting.
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Shutdown timed out, exiting');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

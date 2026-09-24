const POSTGRES_INVALID_INPUT = '22P02';
const POSTGRES_UNIQUE_VIOLATION = '23505';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  if (res.headersSent) {
    return res.destroy(err);
  }

  if (err.code === POSTGRES_INVALID_INPUT) {
    return res.status(400).json({ error: 'Invalid request parameter' });
  }

  // Services throw this when they detect a duplicate name, which is a 409 conflict.
  if (err.code === POSTGRES_UNIQUE_VIOLATION) {
    return res.status(409).json({ error: 'That name is already in use' });
  }

  // Services attach `status` when they can describe the failure safely.
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };

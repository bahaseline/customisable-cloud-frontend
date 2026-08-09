const POSTGRES_INVALID_INPUT = '22P02';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return res.destroy(err);
  }

  if (err.code === POSTGRES_INVALID_INPUT) {
    return res.status(400).json({ error: 'Invalid request parameter' });
  }

  // Services attach `status` when they can describe the failure safely.
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };

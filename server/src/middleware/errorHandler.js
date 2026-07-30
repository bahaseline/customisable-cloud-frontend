const POSTGRES_INVALID_INPUT = '22P02';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === POSTGRES_INVALID_INPUT) {
    return res.status(400).json({ error: 'Invalid request parameter' });
  }

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler };

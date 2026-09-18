const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

const skip = () => process.env.NODE_ENV === 'test';

const passOnStoreError = true;

function buildStore(prefix) {
  const client = getRedisClient();
  if (!client) return undefined; // express-rate-limit's default in-memory store

  return new RedisStore({
    prefix,
    sendCommand: (...args) => client.sendCommand(args),
  });
}

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
  store: buildStore('rl:api:'),
  passOnStoreError,
  skip,
});

// The OAuth entry point is unauthenticated and each attempt is a round trip
// to Google, so it is limited more tightly than the rest of the API.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts, please try again later.' },
  store: buildStore('rl:auth:'),
  passOnStoreError,
  skip,
});

module.exports = { apiLimiter, authLimiter };

const { createClient } = require('redis');

// Shared across both rate limiters (and anything else that needs Redis later).
let client = null;

function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  if (client) return client;

  client = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 1000, reconnectStrategy: false },
  });
  client.on('error', (err) => console.error('Redis error:', err.message));

  // Connect lazily
  client.connect().catch((err) => {
    console.error('Could not connect to Redis, rate limiting will run in-memory:', err.message);
    client = null;
  });

  return client;
}

async function closeRedis() {
  if (client?.isOpen) await client.close();
}

module.exports = { getRedisClient, closeRedis };

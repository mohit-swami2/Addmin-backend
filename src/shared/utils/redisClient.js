import Redis from 'ioredis';

let redis = null;

export const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1 });
    redis.on('error', () => {});
  }
  return redis;
};

import mongoose from 'mongoose';
import { connectDatabase } from '../../config/db.js';
import { isS3Configured, verifyBucketAccess } from '../../shared/services/s3.js';

const DB_STATE_LABELS = ['disconnected', 'connected', 'connecting', 'disconnecting'];
const CHECK_TIMEOUT_MS = Number(process.env.HEALTH_CHECK_TIMEOUT_MS) || 5000;

const withTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${CHECK_TIMEOUT_MS}ms`)), CHECK_TIMEOUT_MS);
    }),
  ]);

const formatUptime = (seconds) => {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

export const checkDatabase = async () => {
  try {
    await withTimeout(connectDatabase(), 'Database connection');
    const { readyState, host, name } = mongoose.connection;
    const connected = readyState === 1;
    return {
      status: connected ? 'connected' : DB_STATE_LABELS[readyState] || 'unknown',
      ok: connected,
      readyState,
      host: host || null,
      database: name || null,
    };
  } catch (err) {
    return {
      status: 'error',
      ok: false,
      message: err.message,
    };
  }
};

export const checkServer = () => {
  const memory = process.memoryUsage();
  return {
    status: 'running',
    ok: true,
    uptimeSeconds: process.uptime(),
    uptime: formatUptime(process.uptime()),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    host: process.env.VERCEL === '1' ? 'vercel-serverless' : 'local',
    memoryMb: {
      rss: Math.round(memory.rss / 1024 / 1024),
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
    },
  };
};

export const checkStorage = async () => {
  if (!isS3Configured()) {
    return {
      status: 'local',
      ok: true,
      provider: 'filesystem',
      message: 'S3 not configured; using local uploads3 storage',
    };
  }
  try {
    await withTimeout(verifyBucketAccess(), 'S3 bucket access');
    return {
      status: 'connected',
      ok: true,
      provider: 's3',
      bucket: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_REGION,
    };
  } catch (err) {
    return {
      status: 'error',
      ok: false,
      provider: 's3',
      message: err.message,
    };
  }
};

export const getHealthReport = async () => {
  const [database, storage] = await Promise.all([checkDatabase(), checkStorage()]);
  const server = checkServer();

  const checks = { server, database, storage };
  const allOk = Object.values(checks).every((c) => c.ok);
  const overallStatus = allOk ? 'healthy' : 'unhealthy';

  return {
    overallStatus,
    allOk,
    timestamp: new Date().toISOString(),
    checks,
  };
};

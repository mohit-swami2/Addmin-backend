import { sendError } from '../utils/response.js';
import ErrorLog from '../../modules/errorLog/errorLog.model.js';

const fingerprintError = (err) => {
  const msg = err.message || 'Unknown error';
  const stack = err.stack?.split('\n').slice(0, 3).join('|') || '';
  return `${msg}::${stack}`;
};

export const errorHandler = async (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const details = err.details || null;

  console.error('[error]', status, message, details || '');

  try {
    const windowSec = Number(process.env.ERROR_LOG_GROUP_WINDOW_SECONDS) || 300;
    const fingerprint = fingerprintError(err);
    const since = new Date(Date.now() - windowSec * 1000);
    const existing = await ErrorLog.findOne({ fingerprint, lastSeenAt: { $gte: since } });
    if (existing) {
      existing.occurrenceCount += 1;
      existing.lastSeenAt = new Date();
      existing.message = message;
      await existing.save();
    } else {
      await ErrorLog.create({
        fingerprint,
        message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        statusCode: status,
        occurrenceCount: 1,
        lastSeenAt: new Date(),
      });
    }
  } catch (logErr) {
    console.error('[errorLog] failed to persist', logErr.message);
  }

  return sendError(res, { status, message, details });
};

export const notFoundHandler = (req, res) =>
  sendError(res, { status: 404, message: `Route not found: ${req.method} ${req.originalUrl}` });

import { sendSuccess, sendError } from '../../shared/utils/response.js';
import { getHealthReport } from './health.service.js';

export const healthCheck = async (_req, res) => {
  try {
    const report = await getHealthReport();
    const { checks, overallStatus, timestamp } = report;

    const payload = {
      status: overallStatus,
      timestamp,
      server: checks.server,
      database: checks.database,
      storage: checks.storage,
    };

    if (report.allOk) {
      return sendSuccess(res, {
        status: 200,
        message: 'All systems operational',
        data: [payload],
      });
    }

    return sendError(res, {
      status: 503,
      message: 'Service unhealthy — one or more checks failed',
      data: [payload],
    });
  } catch (err) {
    return sendError(res, {
      status: 500,
      message: err.message || 'Health check failed',
    });
  }
};

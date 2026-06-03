import { sendSuccess } from '../../shared/utils/response.js';
import * as dashboardService from './dashboard.service.js';

export const overview = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverview();
    return sendSuccess(res, { message: 'Dashboard overview', data: [data] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

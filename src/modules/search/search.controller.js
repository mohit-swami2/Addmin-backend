import { sendSuccess } from '../../shared/utils/response.js';
import * as searchService from './search.service.js';

export const search = async (req, res, next) => {
  try {
    const { q, limit } = req.parsedQuery || req.query;
    const result = await searchService.globalSearch({ q, limit });
    return sendSuccess(res, {
      message: 'Search results',
      data: [result],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

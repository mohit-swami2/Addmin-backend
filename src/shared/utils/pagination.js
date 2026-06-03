import { MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT } from './constants.js';

export const getPaginationOptions = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  let limit = parseInt(query.limit, 10) || DEFAULT_PAGE_LIMIT;
  if (limit > MAX_PAGE_LIMIT) limit = MAX_PAGE_LIMIT;
  if (limit < 1) limit = DEFAULT_PAGE_LIMIT;

  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    skip,
    sortStage: { [sortBy]: sortOrder },
  };
};

export const buildPaginationMeta = ({ page, limit, total, sortBy = 'createdAt' }) => ({
  page,
  limit,
  total,
  sort: sortBy,
  totalPages: Math.ceil(total / limit) || 1,
});

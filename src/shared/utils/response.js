export const sendSuccess = (res, { message = 'Success', data = [], pagination = null, status = 200 }) => {
  const payload = {
    success: true,
    message,
    data: Array.isArray(data) ? data : [data],
  };
  if (pagination) {
    payload.pagination = pagination;
  }
  return res.status(status).json(payload);
};

export const sendError = (res, { status = 500, message = 'Internal server error', details = null, data = [] }) => {
  const payload = { success: false, message, data: Array.isArray(data) ? data : data ? [data] : [] };
  if (details) payload.details = details;
  return res.status(status).json(payload);
};

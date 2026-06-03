import rateLimit from 'express-rate-limit';

const baseOptions = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
};

export const getRequestLimiter = rateLimit({
  ...baseOptions,
  max: 200,
  message: { success: false, message: 'Too many requests', data: [] },
});

export const authLimiter = rateLimit({
  ...baseOptions,
  max: 30,
  message: { success: false, message: 'Too many auth attempts', data: [] },
});

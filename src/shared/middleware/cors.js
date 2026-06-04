import cors from 'cors';

const parseOrigins = () => {
  const list = [
    process.env.WEB_ORIGIN,
    ...(process.env.FRONTEND_URL?.split(',') || []),
    ...(process.env.CORS_WHITELIST?.split(',') || []),
  ]
    .map((o) => o?.trim())
    .filter(Boolean);
  return [...new Set(list)];
};

export const corsMiddleware = cors({
  origin(origin, callback) {
    const allowed = parseOrigins();
    if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});

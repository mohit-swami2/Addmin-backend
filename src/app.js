import express from 'express';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { corsMiddleware } from './shared/middleware/cors.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import adminRoutes from './routes/admin/index.js';
import { connectDatabase } from './config/db.js';
import { healthCheck } from './modules/health/health.controller.js';
import { isS3Configured } from './shared/services/s3.js';
import { UPLOAD_ROOT, UPLOAD_URL_PATH } from './shared/utils/uploadPaths.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', healthCheck);

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next({ status: 500, message: err.message || 'Database connection failed' });
  }
});

if (process.env.VERCEL !== '1' && !isS3Configured()) {
  app.use(UPLOAD_URL_PATH, express.static(path.join(__dirname, `../${UPLOAD_ROOT}`)));
}

app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { getRequestLimiter } from '../../shared/middleware/rateLimiter.js';
import * as controller from './search.controller.js';
import { globalSearchQuerySchema } from './search.schemas.js';

const router = Router();

router.get('/', requireAuth, getRequestLimiter, validate(globalSearchQuerySchema, 'query'), controller.search);

export default router;
